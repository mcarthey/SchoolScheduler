using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class ClassEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ClassEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetClasses_ReturnsSuccessAndClasses()
    {
        // Act
        var response = await _client.GetAsync("/classes");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var classes = await response.Content.ReadFromJsonAsync<List<ClassModel>>();
        classes.Should().NotBeNull();
        classes.Should().NotBeEmpty();
    }

    [Fact]
    public async Task PostClass_WithValidModel_ReturnsCreated()
    {
        // Arrange
        var newClass = new ClassModel
        {
            Name = "Math 11",
            Term = "Semester",
            TermSlot = "S2",
            DurationType = "Block",
            Priority = 7
        };

        // Act
        var response = await _client.PostAsJsonAsync("/classes", newClass);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var createdClass = await response.Content.ReadFromJsonAsync<ClassModel>();
        createdClass.Should().NotBeNull();
        createdClass!.Id.Should().BeGreaterThan(0);
        createdClass.Name.Should().Be("Math 11");
    }

    [Fact]
    public async Task PostClass_WithInvalidModel_ReturnsBadRequest()
    {
        // Arrange - Missing required fields
        var invalidClass = new ClassModel
        {
            Name = "", // Invalid: empty name
            Term = "Semester",
            TermSlot = "S1",
            DurationType = "Block",
            Priority = 5
        };

        // Act
        var response = await _client.PostAsJsonAsync("/classes", invalidClass);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeleteClass_WithValidId_ReturnsNoContent()
    {
        // Arrange - Create a class first
        var newClass = new ClassModel
        {
            Name = "Delete Test",
            Term = "Semester",
            TermSlot = "S1",
            DurationType = "Block",
            Priority = 5
        };

        var createResponse = await _client.PostAsJsonAsync("/classes", newClass);
        var createdClass = await createResponse.Content.ReadFromJsonAsync<ClassModel>();

        // Act
        var deleteResponse = await _client.DeleteAsync($"/classes/{createdClass!.Id}");
        
        // Assert
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteClass_WithInvalidId_ReturnsNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/classes/99999");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task PostClass_UpdateExisting_ReturnsOk()
    {
        // Arrange - Create a class first
        var newClass = new ClassModel
        {
            Name = "Update Test",
            Term = "Semester",
            TermSlot = "S1",
            DurationType = "Block",
            Priority = 5
        };

        var createResponse = await _client.PostAsJsonAsync("/classes", newClass);
        var createdClass = await createResponse.Content.ReadFromJsonAsync<ClassModel>();

        // Act - Update the class
        createdClass!.Name = "Updated Name";
        createdClass.Priority = 8;
        var updateResponse = await _client.PostAsJsonAsync("/classes", createdClass);
        
        // Assert
        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updatedClass = await updateResponse.Content.ReadFromJsonAsync<ClassModel>();
        updatedClass.Should().NotBeNull();
        updatedClass!.Name.Should().Be("Updated Name");
        updatedClass.Priority.Should().Be(8);
    }
}
