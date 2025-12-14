using System.ComponentModel.DataAnnotations;
using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class ClassModelTests
{
    private static List<ValidationResult> ValidateModel(ClassModel model)
    {
        var validationResults = new List<ValidationResult>();
        var context = new ValidationContext(model, null, null);
        Validator.TryValidateObject(model, context, validationResults, true);
        return validationResults;
    }

    [Fact]
    public void ClassModel_WithValidData_PassesValidation()
    {
        // Arrange
        var model = new ClassModel
        {
            Name = "English 10",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 80,
            Priority = 5
        };

        // Act
        var results = ValidateModel(model);

        // Assert
        results.Should().BeEmpty();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void ClassModel_WithInvalidName_FailsValidation(string invalidName)
    {
        // Arrange
        var model = new ClassModel
        {
            Name = invalidName!,
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 80,
            Priority = 5
        };

        // Act
        var results = ValidateModel(model);

        // Assert
        results.Should().NotBeEmpty();
        results.Should().Contain(r => r.MemberNames.Contains("Name"));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(601)]
    [InlineData(-1)]
    public void ClassModel_WithInvalidMinutes_FailsValidation(int invalidMinutes)
    {
        // Arrange
        var model = new ClassModel
        {
            Name = "Math 10",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = invalidMinutes,
            Priority = 5
        };

        // Act
        var results = ValidateModel(model);

        // Assert
        results.Should().NotBeEmpty();
        results.Should().Contain(r => r.MemberNames.Contains("MinutesPerSession"));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    [InlineData(-1)]
    public void ClassModel_WithInvalidPriority_FailsValidation(int invalidPriority)
    {
        // Arrange
        var model = new ClassModel
        {
            Name = "Science 10",
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 80,
            Priority = invalidPriority
        };

        // Act
        var results = ValidateModel(model);

        // Assert
        results.Should().NotBeEmpty();
        results.Should().Contain(r => r.MemberNames.Contains("Priority"));
    }

    [Fact]
    public void ClassModel_NameTooLong_FailsValidation()
    {
        // Arrange
        var model = new ClassModel
        {
            Name = new string('A', 201), // MaxLength is 200
            Term = "Semester",
            DurationType = "Block",
            StartDate = DateTime.Parse("2025-09-01"),
            EndDate = DateTime.Parse("2026-01-20"),
            MinutesPerSession = 80,
            Priority = 5
        };

        // Act
        var results = ValidateModel(model);

        // Assert
        results.Should().NotBeEmpty();
        results.Should().Contain(r => r.MemberNames.Contains("Name"));
    }
}
