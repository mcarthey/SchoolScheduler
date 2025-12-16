namespace SchoolScheduler.Data;

/// <summary>
/// Result of validating a student's course selection plan.
/// </summary>
public class PlanValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public PlanStatistics Statistics { get; set; } = new();
}

/// <summary>
/// Statistics about a course selection plan.
/// </summary>
public class PlanStatistics
{
    public int TotalCourses { get; set; }
    public decimal TotalCredits { get; set; }
    public int AdvancedCourses { get; set; }
    public int TotalPeriods { get; set; }
    public Dictionary<string, decimal> CreditsByDepartment { get; set; } = new();
    public Dictionary<string, int> CoursesByDuration { get; set; } = new();
    public double AverageWorkload { get; set; }
    public int EstimatedHomeworkHoursPerWeek { get; set; }
}

/// <summary>
/// Graduation requirements for tracking progress.
/// Based on typical OHS requirements - can be updated with actual sheet.
/// </summary>
public class GraduationRequirements
{
    /// <summary>
    /// Required credits by department for graduation.
    /// TODO: Update these with actual OHS requirements from the yearly sheet.
    /// </summary>
    public Dictionary<string, decimal> RequiredCreditsByDepartment { get; set; } = new()
    {
        { "English", 4.0m },              // 4 years (English 9, 10, 11, 12)
        { "Math", 3.0m },                 // 3 years (Algebra 1, Geometry, Algebra 2)
        { "Science", 3.0m },              // 3 years (Biology, Chemistry, Physics/other)
        { "Social Studies", 3.0m },       // 3 years (World History, US History, Government/Economics)
        { "Physical Education", 1.5m },   // 1.5 credits
        { "Health", 0.5m },               // 0.5 credits (1 semester)
        { "World Language", 2.0m },       // 2 years recommended for college
        { "Electives", 7.0m }             // Remaining credits to reach 24 total
    };

    public decimal TotalCreditsRequired => 24.0m; // Standard high school requirement

    /// <summary>
    /// Recommended courses by grade level.
    /// Based on typical college-prep pathway.
    /// </summary>
    public Dictionary<int, List<string>> RecommendedCoursesByGrade { get; set; } = new()
    {
        {
            9, new List<string>
            {
                "English 9",
                "Algebra 1 or Geometry",
                "Biology",
                "World History",
                "World Language (Spanish, French, German, etc.)",
                "Physical Education",
                "Health",
                "Elective (Art, Music, etc.)"
            }
        },
        {
            10, new List<string>
            {
                "English 10",
                "Geometry or Algebra 2",
                "Chemistry",
                "Social Studies (varies by school)",
                "World Language (Year 2)",
                "Physical Education",
                "Electives"
            }
        },
        {
            11, new List<string>
            {
                "English 11 or AP English Language",
                "Algebra 2 or Pre-Calculus",
                "Physics or AP Science",
                "US History or AP US History",
                "World Language (Year 3 - optional)",
                "Electives (consider AP courses for college)"
            }
        },
        {
            12, new List<string>
            {
                "English 12 or AP English Literature",
                "Pre-Calculus, Statistics, or AP Calculus",
                "Science Elective or AP Science",
                "Government/Economics",
                "Electives (AP courses for college credit)"
            }
        }
    };

    /// <summary>
    /// College admission recommendations (for reference).
    /// </summary>
    public Dictionary<string, string> CollegeRecommendations { get; set; } = new()
    {
        { "Competitive Colleges", "4 years English, 4 years Math, 4 years Science, 3-4 years Social Studies, 3-4 years World Language, multiple AP courses" },
        { "State Universities", "4 years English, 3-4 years Math, 3 years Science, 3 years Social Studies, 2-3 years World Language" },
        { "Technical/Community", "4 years English, 3 years Math, 2-3 years Science, 2-3 years Social Studies" }
    };

    /// <summary>
    /// Expected credits earned by end of each grade.
    /// Helps students track if they're on pace.
    /// </summary>
    public Dictionary<int, decimal> ExpectedCreditsByGrade { get; set; } = new()
    {
        { 9, 6.0m },   // ~6 credits freshman year
        { 10, 12.0m }, // ~12 credits by end of sophomore year
        { 11, 18.0m }, // ~18 credits by end of junior year
        { 12, 24.0m }  // 24 credits to graduate
    };

    /// <summary>
    /// Get progress toward graduation for a given grade level and earned credits.
    /// </summary>
    public GraduationProgress GetProgress(int gradeLevel, Dictionary<string, decimal> earnedCredits, decimal totalCredits)
    {
        var progress = new GraduationProgress
        {
            GradeLevel = gradeLevel,
            TotalCreditsEarned = totalCredits,
            TotalCreditsRequired = TotalCreditsRequired,
            ExpectedCredits = ExpectedCreditsByGrade[gradeLevel],
            OnTrack = totalCredits >= ExpectedCreditsByGrade[gradeLevel]
        };

        foreach (var requirement in RequiredCreditsByDepartment)
        {
            var earned = earnedCredits.GetValueOrDefault(requirement.Key, 0m);
            var remaining = requirement.Value - earned;

            progress.DepartmentProgress.Add(new DepartmentProgress
            {
                Department = requirement.Key,
                Required = requirement.Value,
                Earned = earned,
                Remaining = Math.Max(0, remaining),
                Complete = earned >= requirement.Value
            });
        }

        return progress;
    }
}

/// <summary>
/// Represents a student's progress toward graduation.
/// </summary>
public class GraduationProgress
{
    public int GradeLevel { get; set; }
    public decimal TotalCreditsEarned { get; set; }
    public decimal TotalCreditsRequired { get; set; }
    public decimal ExpectedCredits { get; set; }
    public bool OnTrack { get; set; }
    public List<DepartmentProgress> DepartmentProgress { get; set; } = new();
}

/// <summary>
/// Progress toward a specific department requirement.
/// </summary>
public class DepartmentProgress
{
    public string Department { get; set; } = "";
    public decimal Required { get; set; }
    public decimal Earned { get; set; }
    public decimal Remaining { get; set; }
    public bool Complete { get; set; }
}
