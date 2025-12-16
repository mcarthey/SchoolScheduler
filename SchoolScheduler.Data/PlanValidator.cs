namespace SchoolScheduler.Data;

/// <summary>
/// Service to validate student course selection plans.
/// Checks prerequisites, credit requirements, workload, and duration conflicts.
/// </summary>
public class PlanValidator
{
    private readonly GraduationRequirements _requirements = new();

    public PlanValidationResult Validate(StudentPlan plan, List<Course> allCourses)
    {
        var result = new PlanValidationResult { IsValid = true };
        var selectedCourses = allCourses.Where(c => plan.SelectedCourseIds.Contains(c.Id)).ToList();

        // Calculate statistics
        result.Statistics = CalculateStatistics(selectedCourses);

        // Run validation checks
        CheckPrerequisites(selectedCourses, allCourses, result);
        CheckDurationConflicts(selectedCourses, result);
        CheckPeriodCapacity(selectedCourses, result);
        CheckGradeLevelEligibility(selectedCourses, plan.GradeLevel, result);
        CheckWorkload(result.Statistics, result);
        CheckGraduationProgress(result.Statistics, plan.GradeLevel, result);

        result.IsValid = result.Errors.Count == 0;
        return result;
    }

    private PlanStatistics CalculateStatistics(List<Course> courses)
    {
        var stats = new PlanStatistics
        {
            TotalCourses = courses.Count,
            TotalCredits = courses.Sum(c => c.Credits),
            AdvancedCourses = courses.Count(c => c.IsAdvanced),
            TotalPeriods = courses.Sum(c => c.PeriodsRequired),
            AverageWorkload = courses.Any() ? courses.Average(c => c.WorkloadLevel) : 0
        };

        // Credits by department
        stats.CreditsByDepartment = courses
            .GroupBy(c => c.Department)
            .ToDictionary(g => g.Key, g => g.Sum(c => c.Credits));

        // Courses by duration
        stats.CoursesByDuration = courses
            .GroupBy(c => c.Duration)
            .ToDictionary(g => g.Key, g => g.Count());

        // Estimate homework (rough calculation: workload level * 2 hours per course)
        stats.EstimatedHomeworkHoursPerWeek = courses.Sum(c => c.WorkloadLevel * 2);

        return stats;
    }

    private void CheckPrerequisites(List<Course> selectedCourses, List<Course> allCourses, PlanValidationResult result)
    {
        foreach (var course in selectedCourses)
        {
            if (course.PrerequisiteIds.Length == 0) continue;

            var prereqNames = allCourses
                .Where(c => course.PrerequisiteIds.Contains(c.Id))
                .Select(c => c.Name)
                .ToList();

            if (prereqNames.Any())
            {
                result.Warnings.Add(
                    $"{course.Name} requires: {string.Join(", ", prereqNames)}. " +
                    "Make sure you've completed or are currently enrolled in these courses."
                );
            }
        }
    }

    private void CheckDurationConflicts(List<Course> courses, PlanValidationResult result)
    {
        // Check for semester/quarter conflicts in same department
        var departmentGroups = courses
            .Where(c => c.Duration.Contains("Semester") || c.Duration.Contains("Quarter"))
            .GroupBy(c => new { c.Department, c.Duration });

        foreach (var group in departmentGroups.Where(g => g.Count() > 1))
        {
            var courseNames = string.Join(", ", group.Select(c => c.Name));
            result.Warnings.Add(
                $"You have multiple {group.Key.Department} courses in {group.Key.Duration}: {courseNames}. " +
                "Verify these don't overlap when schedules are published."
            );
        }
    }

    private void CheckPeriodCapacity(List<Course> courses, PlanValidationResult result)
    {
        var totalPeriods = courses.Sum(c => c.PeriodsRequired);

        // OHS has 4 main blocks (A, B, C, D) = 8 periods available (each block can have 2 skinny classes)
        const int maxPeriods = 8;

        if (totalPeriods > maxPeriods)
        {
            result.Errors.Add(
                $"Too many periods required: {totalPeriods} periods selected, but only {maxPeriods} are available. " +
                "Remove some courses or choose skinny options."
            );
        }
        else if (totalPeriods < 6)
        {
            result.Warnings.Add(
                $"Only {totalPeriods} periods selected. Most students take 6-8 classes. " +
                "Consider adding more courses to meet graduation requirements."
            );
        }
    }

    private void CheckGradeLevelEligibility(List<Course> courses, int gradeLevel, PlanValidationResult result)
    {
        var ineligibleCourses = courses
            .Where(c => c.GradeLevels.Length > 0 && !c.GradeLevels.Contains(gradeLevel))
            .ToList();

        foreach (var course in ineligibleCourses)
        {
            var allowedGrades = string.Join(", ", course.GradeLevels.OrderBy(g => g));
            result.Errors.Add(
                $"{course.Name} is not available for grade {gradeLevel}. " +
                $"This course is offered for grades: {allowedGrades}."
            );
        }
    }

    private void CheckWorkload(PlanStatistics stats, PlanValidationResult result)
    {
        if (stats.AdvancedCourses > 4)
        {
            result.Warnings.Add(
                $"Heavy course load: {stats.AdvancedCourses} AP/Honors courses. " +
                $"Estimated {stats.EstimatedHomeworkHoursPerWeek} hours/week of homework. " +
                "Consider your extracurriculars and work commitments."
            );
        }

        if (stats.AverageWorkload > 4.0)
        {
            result.Warnings.Add(
                "Very demanding schedule. Make sure you have adequate study time and support."
            );
        }
    }

    private void CheckGraduationProgress(PlanStatistics stats, int gradeLevel, PlanValidationResult result)
    {
        // Expected progress by grade level (cumulative credits)
        var expectedCredits = gradeLevel switch
        {
            9 => 6.0m,   // Freshmen: ~6 credits
            10 => 12.0m, // Sophomores: ~12 credits total
            11 => 18.0m, // Juniors: ~18 credits total
            12 => 24.0m, // Seniors: all 24 credits
            _ => 0m
        };

        foreach (var dept in _requirements.RequiredCreditsByDepartment)
        {
            var earnedCredits = stats.CreditsByDepartment.GetValueOrDefault(dept.Key, 0m);
            var requiredCredits = dept.Value;
            var remainingCredits = requiredCredits - earnedCredits;

            if (gradeLevel == 12 && earnedCredits < requiredCredits)
            {
                result.Errors.Add(
                    $"Graduation requirement not met: {dept.Key} requires {requiredCredits} credits, " +
                    $"but you only have {earnedCredits} this year. Need {remainingCredits} more credits."
                );
            }
            else if (remainingCredits > 0)
            {
                result.Warnings.Add(
                    $"{dept.Key}: Need {remainingCredits} more credits to graduate " +
                    $"({earnedCredits} of {requiredCredits} this year)."
                );
            }
        }

        // Total credit check
        if (gradeLevel == 12 && stats.TotalCredits < 6.0m)
        {
            result.Warnings.Add(
                $"Only {stats.TotalCredits} credits selected for senior year. " +
                "Ensure you have enough credits from previous years to graduate."
            );
        }
    }
}
