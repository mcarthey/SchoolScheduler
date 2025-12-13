using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class ClassEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ClassEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove the real database
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<SchedulerDbContext>));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                // Add in-memory database for testing
                services.AddDbContext<SchedulerDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });
            });
        });
    }

    [Fact]
    public async Task GetClasses_ReturnsSuccessStatusCode()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/classes");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetClasses_ReturnsListOfClasses()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var classes = await client.GetFromJsonAsync<List<ClassModel>>("/classes");

        // Assert
        classes.Should().NotBeNull();
        classes.Should().BeOfType<List<ClassModel>>();
    }

    [Fact]
    public async Task PostClass_WithValidData_ReturnsCreated()
    {
        // Arrange
        var client = _factory.CreateClient();
        var newClass = new ClassModel
        {
            Name = "Test Class",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 90,
            Priority = 7
        };

        // Act
        var response = await client.PostAsJsonAsync("/classes", newClass);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var createdClass = await response.Content.ReadFromJsonAsync<ClassModel>();
        createdClass.Should().NotBeNull();
        createdClass!.Name.Should().Be("Test Class");
        createdClass.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task PostClass_WithInvalidData_ReturnsBadRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var invalidClass = new ClassModel
        {
            Name = "", // Invalid: required field
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 90,
            Priority = 7
        };

        // Act
        var response = await client.PostAsJsonAsync("/classes", invalidClass);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PostClass_WithMinutesOutOfRange_ReturnsBadRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var invalidClass = new ClassModel
        {
            Name = "Test Class",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 0, // Invalid: must be 1-600
            Priority = 7
        };

        // Act
        var response = await client.PostAsJsonAsync("/classes", invalidClass);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PostClass_WithPriorityOutOfRange_ReturnsBadRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var invalidClass = new ClassModel
        {
            Name = "Test Class",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 90,
            Priority = 11 // Invalid: must be 1-10
        };

        // Act
        var response = await client.PostAsJsonAsync("/classes", invalidClass);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
