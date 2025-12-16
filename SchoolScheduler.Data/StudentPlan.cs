using System.ComponentModel.DataAnnotations;

namespace SchoolScheduler.Data;

/// <summary>
/// Represents a student's course selection plan for a school year.
/// This is what students build when choosing courses, before scheduling is finalized.
/// </summary>
public class StudentPlan
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string StudentName { get; set; } = "";

    /// <summary>
    /// Grade level for this plan (9, 10, 11, 12)
    /// </summary>
    [Range(9, 12)]
    public int GradeLevel { get; set; }

    /// <summary>
    /// School year (e.g., "2025-2026")
    /// </summary>
    [Required, MaxLength(20)]
    public string SchoolYear { get; set; } = "";

    /// <summary>
    /// Course IDs selected for this plan
    /// </summary>
    public int[] SelectedCourseIds { get; set; } = Array.Empty<int>();

    /// <summary>
    /// When this plan was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// When this plan was last modified
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Notes/comments for this plan
    /// </summary>
    [MaxLength(1000)]
    public string? Notes { get; set; }
}
