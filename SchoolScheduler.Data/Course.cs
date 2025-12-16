using System.ComponentModel.DataAnnotations;

namespace SchoolScheduler.Data;

/// <summary>
/// Represents a course offered at the school.
/// This is the catalog of available courses from Xello.
/// </summary>
public class Course
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    /// <summary>
    /// Course code from Xello (e.g., "ENG101", "MATH201")
    /// </summary>
    [MaxLength(50)]
    public string? CourseCode { get; set; }

    /// <summary>
    /// Department: "English", "Math", "Science", "Social Studies", etc.
    /// </summary>
    [Required, MaxLength(100)]
    public string Department { get; set; } = "";

    /// <summary>
    /// Duration: "Full Year", "Semester 1", "Semester 2", "Quarter 1", etc.
    /// </summary>
    [Required, MaxLength(50)]
    public string Duration { get; set; } = "";

    /// <summary>
    /// Block type: "Block" (85 min) or "Skinny" (40 min)
    /// </summary>
    [Required, MaxLength(50)]
    public string BlockType { get; set; } = "";

    /// <summary>
    /// Credits earned (0.5, 1.0, 1.5, etc.)
    /// </summary>
    [Range(0.0, 2.0)]
    public decimal Credits { get; set; }

    /// <summary>
    /// Grade level(s) this course is offered for (9, 10, 11, 12)
    /// Can be multiple: [10, 11, 12]
    /// </summary>
    public int[] GradeLevels { get; set; } = Array.Empty<int>();

    /// <summary>
    /// Course IDs of prerequisites (references other Course.Id values)
    /// </summary>
    public int[] PrerequisiteIds { get; set; } = Array.Empty<int>();

    /// <summary>
    /// Is this an AP, Honors, or CCP course?
    /// </summary>
    public bool IsAdvanced { get; set; }

    /// <summary>
    /// Course description from Xello
    /// </summary>
    [MaxLength(2000)]
    public string? Description { get; set; }

    /// <summary>
    /// How many periods does this course occupy? (1 or 2 for double-block sciences)
    /// </summary>
    [Range(1, 2)]
    public int PeriodsRequired { get; set; } = 1;

    /// <summary>
    /// Typical difficulty/workload estimate (1-5, where 5 is most demanding)
    /// </summary>
    [Range(1, 5)]
    public int WorkloadLevel { get; set; } = 3;
}
