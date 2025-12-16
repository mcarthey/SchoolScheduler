using System.ComponentModel.DataAnnotations;

namespace SchoolScheduler.Data;

public class ClassModel
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    [Required]
    public string Term { get; set; } = "";

    [Required]
    public string DurationType { get; set; } = "";

    [Required]
    public string StartTime { get; set; } = "";

    [Required]
    public int[] DaysOfWeek { get; set; } = Array.Empty<int>();

    [Range(1, 10)]
    public int Priority { get; set; }
}
