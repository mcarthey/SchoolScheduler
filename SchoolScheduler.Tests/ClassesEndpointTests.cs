using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using SchoolScheduler.Data;
using Xunit;

namespace SchoolScheduler.Tests;

public class ClassesEndpointTests
{
    private static WebApplicationFactory<Program> CreateFactory() =>
        new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.UseEnvironment("Testing"));

    [Fact]
    public async Task GetClasses_returns_seeded_class()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/classes");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var classes = await response.Content.ReadFromJsonAsync<List<ClassModel>>();
        classes.Should().NotBeNull();
        classes!.Any(c => c.Name == "English 10").Should().BeTrue();
    }

    [Fact]
    public async Task PostClasses_persists_new_class()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var newClass = new ClassModel
        {
            Name = "Math 101",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.UtcNow.Date,
            EndDate = DateTime.UtcNow.Date.AddMonths(3),
            MinutesPerSession = 60,
            Priority = 3
        };

        var postResponse = await client.PostAsJsonAsync("/classes", newClass);

        postResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await postResponse.Content.ReadFromJsonAsync<ClassModel>();
        created.Should().NotBeNull();
        created!.Id.Should().BeGreaterThan(0);

        var listResponse = await client.GetAsync("/classes");
        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var classes = await listResponse.Content.ReadFromJsonAsync<List<ClassModel>>();
        classes.Should().NotBeNull();
        classes!.Any(c => c.Name == "Math 101").Should().BeTrue();
    }
}
