using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class StudentPlanEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public StudentPlanEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPlans_ReturnsSuccess()
    {
        // Act
        var response = await _client.GetAsync("/api/plans");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var plans = await response.Content.ReadFromJsonAsync<List<StudentPlan>>();
        plans.Should().NotBeNull();
    }

    [Fact]
    public async Task CreatePlan_WithValidData_ReturnsCreated()
    {
        // Arrange
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        var selectedCourseIds = courses!.Take(6).Select(c => c.Id).ToArray();
        
        var newPlan = new StudentPlan
        {
            StudentName = "Test Student",
            GradeLevel = 10,
            SchoolYear = "2025-2026",
            SelectedCourseIds = selectedCourseIds,
            Notes = "Test plan"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans", newPlan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdPlan = await response.Content.ReadFromJsonAsync<StudentPlan>();
        createdPlan.Should().NotBeNull();
        createdPlan!.Id.Should().BeGreaterThan(0);
        createdPlan.StudentName.Should().Be("Test Student");
        createdPlan.GradeLevel.Should().Be(10);
        createdPlan.SelectedCourseIds.Should().HaveCount(6);
    }

    [Fact]
    public async Task CreatePlan_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange - Missing required fields
        var invalidPlan = new StudentPlan
        {
            StudentName = "", // Invalid: empty name
            GradeLevel = 10,
            SchoolYear = "2025-2026"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/plans", invalidPlan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePlan_WithValidData_ReturnsOk()
    {
        // Arrange - Create a plan first
        var courses = await _client.GetFromJsonAsync<List<Course>>("/api/courses");
        var selectedCourseIds = courses!.Take(5).Select(c => c.Id).ToArray();
        
        var newPlan = new StudentPlan
        {
            StudentName = "Update Test",
            GradeLevel = 11,
            SchoolYear = "2025-2026",
            SelectedCourseIds = selectedCourseIds
        };

        var createResponse = await _client.PostAsJsonAsync("/api/plans", newPlan);
        var createdPlan = await createResponse.Content.ReadFromJsonAsync<StudentPlan>();

        // Act - Update the plan
        createdPlan!.StudentName = "Updated Name";
        createdPlan.Notes = "Added notes";
        var updateResponse = await _client.PutAsJsonAsync($"/api/plans/{createdPlan.Id}", createdPlan);
        
        // Assert
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedPlan = await updateResponse.Content.ReadFromJsonAsync<StudentPlan>();
        updatedPlan.Should().NotBeNull();
        updatedPlan!.StudentName.Should().Be("Updated Name");
        updatedPlan.Notes.Should().Be("Added notes");
    }

    [Fact]
    public async Task UpdatePlan_WithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var plan = new StudentPlan
        {
            Id = 99999,
            StudentName = "Test",
            GradeLevel = 10,
            SchoolYear = "2025-2026"
        };

        // Act
        var response = await _client.PutAsJsonAsync("/api/plans/99999", plan);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeletePlan_WithValidId_ReturnsNoContent()
    {
        // Arrange - Create a plan first
        var newPlan = new StudentPlan
        {
            StudentName = "Delete Test",
            GradeLevel = 9,
            SchoolYear = "2025-2026",
            SelectedCourseIds = Array.Empty<int>()
        };

        var createResponse = await _client.PostAsJsonAsync("/api/plans", newPlan);
        var createdPlan = await createResponse.Content.ReadFromJsonAsync<StudentPlan>();

        // Act
        var deleteResponse = await _client.DeleteAsync($"/api/plans/{createdPlan!.Id}");
        
        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // Verify it's deleted
        var getResponse = await _client.GetAsync($"/api/plans/{createdPlan.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeletePlan_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/api/plans/99999");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetPlan_WithValidId_ReturnsPlan()
    {
        // Arrange - Create a plan first
        var newPlan = new StudentPlan
        {
            StudentName = "Get Test",
            GradeLevel = 12,
            SchoolYear = "2025-2026",
            SelectedCourseIds = Array.Empty<int>()
        };

        var createResponse = await _client.PostAsJsonAsync("/api/plans", newPlan);
        var createdPlan = await createResponse.Content.ReadFromJsonAsync<StudentPlan>();

        // Act
        var getResponse = await _client.GetAsync($"/api/plans/{createdPlan!.Id}");
        
        // Assert
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var retrievedPlan = await getResponse.Content.ReadFromJsonAsync<StudentPlan>();
        retrievedPlan.Should().NotBeNull();
        retrievedPlan!.StudentName.Should().Be("Get Test");
    }
}
