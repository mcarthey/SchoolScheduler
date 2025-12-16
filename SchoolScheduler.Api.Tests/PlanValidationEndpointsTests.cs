using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class PlanValidationEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public PlanValidationEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ValidatePlan_WithValidPlan_ReturnsValidationResult()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        // Select 6 appropriate courses for a 9th grader
        var freshmanCourses = courses!
            .Where(c => c.GradeLevels.Contains(9))
            .Take(6)
            .Select(c => c.Id)
            .ToArray();
        
        var plan = new StudentPlan
        {
            StudentName = "Test Freshman",
            GradeLevel = 9,
            SchoolYear = "2025-2026",
            SelectedCourseIds = freshmanCourses
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans/validate", plan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PlanValidationResult>();
        result.Should().NotBeNull();
        result!.Statistics.Should().NotBeNull();
        result.Statistics.TotalCourses.Should().Be(6);
    }

    [Fact]
    public async Task ValidatePlan_WithTooManyPeriods_ReturnsErrors()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        // Select courses that require too many periods (double-block sciences + regular courses)
        var doubleBlockCourses = courses!
            .Where(c => c.PeriodsRequired == 2)
            .Take(5) // 5 double-block = 10 periods (exceeds 8 max)
            .Select(c => c.Id)
            .ToArray();
        
        var plan = new StudentPlan
        {
            StudentName = "Overloaded Student",
            GradeLevel = 10,
            SchoolYear = "2025-2026",
            SelectedCourseIds = doubleBlockCourses
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans/validate", plan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PlanValidationResult>();
        result.Should().NotBeNull();
        result!.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("Too many periods"));
    }

    [Fact]
    public async Task ValidatePlan_WithWrongGradeLevel_ReturnsErrors()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        // Get English 9 (only for 9th graders)
        var eng9 = courses!.First(c => c.Name == "English 9");
        
        var plan = new StudentPlan
        {
            StudentName = "Wrong Grade",
            GradeLevel = 12, // Senior trying to take 9th grade English
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { eng9.Id }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans/validate", plan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PlanValidationResult>();
        result.Should().NotBeNull();
        result!.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("not available for grade 12"));
    }

    [Fact]
    public async Task ValidatePlan_WithHeavyAPLoad_ReturnsWarnings()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        // Select all AP courses
        var apCourses = courses!
            .Where(c => c.IsAdvanced)
            .Select(c => c.Id)
            .ToArray();
        
        var plan = new StudentPlan
        {
            StudentName = "AP Heavy",
            GradeLevel = 11,
            SchoolYear = "2025-2026",
            SelectedCourseIds = apCourses
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans/validate", plan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PlanValidationResult>();
        result.Should().NotBeNull();
        result!.Warnings.Should().NotBeEmpty();
        result.Warnings.Should().Contain(w => w.Contains("Heavy course load"));
    }

    [Fact]
    public async Task ValidatePlan_CalculatesStatisticsCorrectly()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        var selectedCourses = new List<Course>
        {
            courses!.First(c => c.Name == "English 9"),    // 1 credit
            courses.First(c => c.Name == "Algebra 1"),     // 1 credit
            courses.First(c => c.Name == "Biology"),       // 1 credit, 2 periods
            courses.First(c => c.Name == "World History"), // 1 credit
            courses.First(c => c.Name == "Spanish 1"),     // 1 credit
            courses.First(c => c.Name == "Physical Education") // 0.25 credits
        };

        var plan = new StudentPlan
        {
            StudentName = "Stats Test",
            GradeLevel = 9,
            SchoolYear = "2025-2026",
            SelectedCourseIds = selectedCourses.Select(c => c.Id).ToArray()
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans/validate", plan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PlanValidationResult>();
        result.Should().NotBeNull();
        
        var stats = result!.Statistics;
        stats.TotalCourses.Should().Be(6);
        stats.TotalCredits.Should().Be(5.25m); // 5 * 1.0 + 1 * 0.25
        stats.TotalPeriods.Should().Be(7); // 5 * 1 + 1 * 2
        stats.AdvancedCourses.Should().Be(0);
        
        stats.CreditsByDepartment.Should().ContainKey("English");
        stats.CreditsByDepartment["English"].Should().Be(1.0m);
    }

    [Fact]
    public async Task ValidatePlan_WithPrerequisites_ReturnsWarnings()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        
        // AP Calculus typically has prerequisites
        var apCalc = courses!.FirstOrDefault(c => c.Name == "AP Calculus AB");
        
        if (apCalc != null && apCalc.PrerequisiteIds.Length > 0)
        {
            var plan = new StudentPlan
            {
                StudentName = "Prereq Test",
                GradeLevel = 11,
                SchoolYear = "2025-2026",
                SelectedCourseIds = new[] { apCalc.Id }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/plans/validate", plan);
            
            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<PlanValidationResult>();
            result.Should().NotBeNull();
            result!.Warnings.Should().Contain(w => w.Contains("requires"));
        }
    }
}
