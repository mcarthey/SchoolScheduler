using System.ComponentModel.DataAnnotations;

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
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Range(1, 600)]
    public int MinutesPerSession { get; set; }

    [Range(1, 10)]
    public int Priority { get; set; }
}
