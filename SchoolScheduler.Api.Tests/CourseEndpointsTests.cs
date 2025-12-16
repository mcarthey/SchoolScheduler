using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class CourseEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CourseEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCourses_ReturnsSuccessAndCourses()
    {
        // Act
        var response = await _client.GetAsync("/api/courses");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var courses = await response.Content.ReadFromJsonAsync<List<Course>>();
        courses.Should().NotBeNull();
        courses.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetCourse_WithValidId_ReturnsCourse()
    {
        // Arrange - Get all courses first
        var allCourses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        var firstCourse = allCourses!.First();

        // Act
        var response = await _client.GetAsync($"/api/courses/{firstCourse.Id}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var course = await response.Content.ReadFromJsonAsync<Course>();
        course.Should().NotBeNull();
        course!.Id.Should().Be(firstCourse.Id);
        course.Name.Should().Be(firstCourse.Name);
    }

    [Fact]
    public async Task GetCourse_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/courses/99999");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCoursesByDepartment_ReturnsFilteredCourses()
    {
        // Act
        var response = await _client.GetAsync("/api/courses/department/English");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var courses = await response.Content.ReadFromJsonAsync<List<Course>>();
        courses.Should().NotBeNull();
        courses.Should().NotBeEmpty();
        courses.Should().AllSatisfy(c => c.Department.Should().Be("English"));
    }

    [Fact]
    public async Task GetCoursesByGrade_ReturnsFilteredCourses()
    {
        // Act
        var response = await _client.GetAsync("/api/courses/grade/9");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var courses = await response.Content.ReadFromJsonAsync<List<Course>>();
        courses.Should().NotBeNull();
        courses.Should().NotBeEmpty();
        courses.Should().AllSatisfy(c => c.GradeLevels.Should().Contain(9));
    }

    [Theory]
    [InlineData(10)]
    [InlineData(11)]
    [InlineData(12)]
    public async Task GetCoursesByGrade_MultipleGrades_ReturnsCorrectCourses(int gradeLevel)
    {
        // Act
        var response = await _client.GetAsync($"/api/courses/grade/{gradeLevel}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var courses = await response.Content.ReadFromJsonAsync<List<Course>>();
        courses.Should().NotBeNull();
        courses.Should().AllSatisfy(c => c.GradeLevels.Should().Contain(gradeLevel));
    }

    [Fact]
    public async Task GetCourses_VerifySeededData()
    {
        // Act
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        // Assert
        courses.Should().NotBeNull();
        
        // Verify expected departments
        var departments = courses!.Select(c => c.Department).Distinct().ToList();
        departments.Should().Contain("English");
        departments.Should().Contain("Math");
        departments.Should().Contain("Science");
        departments.Should().Contain("Social Studies");
        
        // Verify AP courses exist
        var apCourses = courses.Where(c => c.IsAdvanced).ToList();
        apCourses.Should().NotBeEmpty();
        
        // Verify different durations
        var durations = courses.Select(c => c.Duration).Distinct().ToList();
        durations.Should().Contain("Full Year");
        
        // Verify different block types
        var blockTypes = courses.Select(c => c.BlockType).Distinct().ToList();
        blockTypes.Should().Contain("Block");
    }
}
