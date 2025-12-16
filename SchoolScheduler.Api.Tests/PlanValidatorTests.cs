using SchoolScheduler.Data;
using Xunit;
using FluentAssertions;

namespace SchoolScheduler.Api.Tests;

public class PlanValidatorTests
{
    private readonly PlanValidator _validator;
    private readonly List<Course> _sampleCourses;

    public PlanValidatorTests()
    {
        _validator = new PlanValidator();
        _sampleCourses = CreateSampleCourses();
    }

    private List<Course> CreateSampleCourses()
    {
        return new List<Course>
        {
            new Course
            {
                Id = 1,
                Name = "English 9",
                Department = "English",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Id = 2,
                Name = "Algebra 1",
                Department = "Math",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9, 10 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Id = 3,
                Name = "Biology",
                Department = "Science",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 2, // Double-block
                WorkloadLevel = 3
            },
            new Course
            {
                Id = 4,
                Name = "AP Biology",
                Department = "Science",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11, 12 },
                PrerequisiteIds = new[] { 3 }, // Requires Biology
                IsAdvanced = true,
                PeriodsRequired = 2,
                WorkloadLevel = 5
            },
            new Course
            {
                Id = 5,
                Name = "AP Calculus",
                Department = "Math",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = true,
                PeriodsRequired = 1,
                WorkloadLevel = 5
            },
            new Course
            {
                Id = 6,
                Name = "PE",
                Department = "Physical Education",
                Duration = "Semester 1",
                BlockType = "Skinny",
                Credits = 0.25m,
                GradeLevels = new[] { 9, 10, 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 1
            }
        };
    }

    [Fact]
    public void Validate_WithValidPlan_ReturnsValid()
    {
        // Arrange
        var plan = new StudentPlan
        {
            StudentName = "Test Student",
            GradeLevel = 9,
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { 1, 2, 3, 6 } // English, Algebra, Biology, PE
        };

        // Act
        var result = _validator.Validate(plan, _sampleCourses);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
        result.Statistics.TotalCourses.Should().Be(4);
        result.Statistics.TotalCredits.Should().Be(3.25m); // 1 + 1 + 1 + 0.25
        result.Statistics.TotalPeriods.Should().Be(5); // 1 + 1 + 2 + 1
    }

    [Fact]
    public void Validate_WithTooManyPeriods_ReturnsError()
    {
        // Arrange - Create 5 double-block courses (10 periods total, exceeds max of 8)
        var doubleBlockCourses = Enumerable.Range(1, 5).Select(i => new Course
        {
            Id = 10 + i,
            Name = $"Science {i}",
            Department = "Science",
            Duration = "Full Year",
            BlockType = "Block",
            Credits = 1.0m,
            GradeLevels = new[] { 9 },
            PrerequisiteIds = Array.Empty<int>(),
            IsAdvanced = false,
            PeriodsRequired = 2,
            WorkloadLevel = 3
        }).ToList();

        var plan = new StudentPlan
        {
            StudentName = "Overloaded",
            GradeLevel = 9,
            SchoolYear = "2025-2026",
            SelectedCourseIds = doubleBlockCourses.Select(c => c.Id).ToArray()
        };

        // Act
        var result = _validator.Validate(plan, doubleBlockCourses);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("Too many periods"));
        result.Statistics.TotalPeriods.Should().Be(10);
    }

    [Fact]
    public void Validate_WithWrongGradeLevel_ReturnsError()
    {
        // Arrange - 12th grader trying to take 9th grade English
        var plan = new StudentPlan
        {
            StudentName = "Senior",
            GradeLevel = 12,
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { 1 } // English 9 (only for grade 9)
        };

        // Act
        var result = _validator.Validate(plan, _sampleCourses);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => 
            e.Contains("English 9") && 
            e.Contains("not available for grade 12"));
    }

    [Fact]
    public void Validate_WithPrerequisites_ReturnsWarning()
    {
        // Arrange - Taking AP Bio without Biology prerequisite
        var plan = new StudentPlan
        {
            StudentName = "Ambitious Junior",
            GradeLevel = 11,
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { 4 } // AP Biology (requires Biology)
        };

        // Act
        var result = _validator.Validate(plan, _sampleCourses);

        // Assert
        result.Warnings.Should().Contain(w => 
            w.Contains("AP Biology") && 
            w.Contains("Biology"));
    }

    [Fact]
    public void Validate_WithHeavyAPLoad_ReturnsWarning()
    {
        // Arrange - Create 5 AP courses
        var apCourses = Enumerable.Range(1, 5).Select(i => new Course
        {
            Id = 20 + i,
            Name = $"AP Subject {i}",
            Department = "Various",
            Duration = "Full Year",
            BlockType = "Block",
            Credits = 1.0m,
            GradeLevels = new[] { 11, 12 },
            PrerequisiteIds = Array.Empty<int>(),
            IsAdvanced = true,
            PeriodsRequired = 1,
            WorkloadLevel = 5
        }).ToList();

        var plan = new StudentPlan
        {
            StudentName = "AP Heavy",
            GradeLevel = 11,
            SchoolYear = "2025-2026",
            SelectedCourseIds = apCourses.Select(c => c.Id).ToArray()
        };

        // Act
        var result = _validator.Validate(plan, apCourses);

        // Assert
        result.Warnings.Should().Contain(w => w.Contains("Heavy course load"));
        result.Statistics.AdvancedCourses.Should().Be(5);
        result.Statistics.EstimatedHomeworkHoursPerWeek.Should().Be(50); // 5 courses * 5 workload * 2
    }

    [Fact]
    public void Validate_WithTooFewCourses_ReturnsWarning()
    {
        // Arrange - Only 2 courses
        var plan = new StudentPlan
        {
            StudentName = "Light Load",
            GradeLevel = 10,
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { 1, 2 }
        };

        // Act
        var result = _validator.Validate(plan, _sampleCourses);

        // Assert
        result.Warnings.Should().Contain(w => w.Contains("Only") && w.Contains("periods"));
    }

    [Fact]
    public void Validate_CalculatesStatisticsCorrectly()
    {
        // Arrange
        var plan = new StudentPlan
        {
            StudentName = "Stats Test",
            GradeLevel = 9,
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { 1, 2, 3, 6 }
        };

        // Act
        var result = _validator.Validate(plan, _sampleCourses);

        // Assert
        var stats = result.Statistics;
        stats.TotalCourses.Should().Be(4);
        stats.TotalCredits.Should().Be(3.25m);
        stats.TotalPeriods.Should().Be(5);
        stats.AdvancedCourses.Should().Be(0);
        stats.AverageWorkload.Should().BeApproximately(2.5, 0.1); // (3+3+3+1)/4
        
        stats.CreditsByDepartment.Should().HaveCount(4);
        stats.CreditsByDepartment["English"].Should().Be(1.0m);
        stats.CreditsByDepartment["Math"].Should().Be(1.0m);
        stats.CreditsByDepartment["Science"].Should().Be(1.0m);
        stats.CreditsByDepartment["Physical Education"].Should().Be(0.25m);
    }

    [Fact]
    public void Validate_WithEmptyPlan_ReturnsWarnings()
    {
        // Arrange
        var plan = new StudentPlan
        {
            StudentName = "Empty",
            GradeLevel = 10,
            SchoolYear = "2025-2026",
            SelectedCourseIds = Array.Empty<int>()
        };

        // Act
        var result = _validator.Validate(plan, _sampleCourses);

        // Assert
        result.Statistics.TotalCourses.Should().Be(0);
        result.Statistics.TotalCredits.Should().Be(0);
        result.Warnings.Should().Contain(w => w.Contains("Only 0 periods"));
    }

    [Fact]
    public void Validate_WithMultipleSemesterCourses_ChecksDurationConflicts()
    {
        // Arrange - Add semester courses
        var semesterCourses = new List<Course>
        {
            new Course
            {
                Id = 30,
                Name = "Art 1",
                Department = "Art",
                Duration = "Semester 1",
                BlockType = "Block",
                Credits = 0.5m,
                GradeLevels = new[] { 9, 10 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 2
            },
            new Course
            {
                Id = 31,
                Name = "Art 2",
                Department = "Art",
                Duration = "Semester 1",
                BlockType = "Block",
                Credits = 0.5m,
                GradeLevels = new[] { 9, 10 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 2
            }
        };

        var plan = new StudentPlan
        {
            StudentName = "Art Student",
            GradeLevel = 10,
            SchoolYear = "2025-2026",
            SelectedCourseIds = new[] { 30, 31 }
        };

        // Act
        var result = _validator.Validate(plan, semesterCourses);

        // Assert
        result.Warnings.Should().Contain(w => 
            w.Contains("Art") && 
            w.Contains("Semester 1"));
    }
}
