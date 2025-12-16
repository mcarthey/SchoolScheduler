using System.ComponentModel.DataAnnotations;

namespace SchoolScheduler.Data;

/// <summary>
/// Represents a class to be scheduled.
/// Classes are scheduled into specific term slots (e.g., S1, Q2, FullYear)
/// and have a duration type that determines their daily time commitment.
/// </summary>
public class ClassModel
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    /// <summary>
    /// The term type: "Semester", "Half-Semester", or "Full-Year".
    /// </summary>
    [Required]
    public string Term { get; set; } = "";

    /// <summary>
    /// The specific term slot where this class is scheduled.
    /// Examples: "S1", "S2", "Q1", "Q2", "Q3", "Q4", "FullYear".
    /// </summary>
    [Required]
    public string TermSlot { get; set; } = "";

    /// <summary>
    /// The duration type: "Block" (1 hour) or "Skinny" (45 minutes).
    /// Determines how many hours per day the class meets.
    /// </summary>
    [Required]
    public string DurationType { get; set; } = "";

    /// <summary>
    /// Scheduling priority (1-10). Higher priority classes are scheduled first.
    /// </summary>
    [Range(1, 10)]
    public int Priority { get; set; }
}
