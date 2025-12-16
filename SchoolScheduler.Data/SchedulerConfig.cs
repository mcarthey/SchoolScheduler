namespace SchoolScheduler.Data;

/// <summary>
/// Configuration for school scheduler: terms, duration types, and school hours.
/// These settings define how classes are scheduled throughout the year.
/// </summary>
public static class SchedulerConfig
{
    /// <summary>
    /// School day hours: start time (8 AM) and end time (4 PM).
    /// </summary>
    public const int SchoolDayStartHour = 8;
    public const int SchoolDayEndHour = 16; // 4 PM in 24-hour format

    /// <summary>
    /// Available terms and their time slots during the year.
    /// Each term maps to specific calendar slots where classes can be scheduled.
    /// </summary>
    public static readonly Dictionary<string, TermConfig> Terms = new()
    {
        {
            "Semester", new TermConfig
            {
                Name = "Semester",
                DurationMonths = 5,
                Slots = new[] { "S1", "S2" }  // S1: Jan-May, S2: Jun-Oct
            }
        },
        {
            "Half-Semester", new TermConfig
            {
                Name = "Half-Semester",
                DurationMonths = 3,
                Slots = new[] { "Q1", "Q2", "Q3", "Q4" }  // Quarters
            }
        },
        {
            "Full-Year", new TermConfig
            {
                Name = "Full-Year",
                DurationMonths = 12,
                Slots = new[] { "FullYear" }  // Entire year
            }
        }
    };

    /// <summary>
    /// Available duration types and their hour allocations.
    /// Duration determines how many hours per day a class meets.
    /// </summary>
    public static readonly Dictionary<string, DurationTypeConfig> DurationTypes = new()
    {
        {
            "Block", new DurationTypeConfig
            {
                Name = "Block",
                Hours = 1  // 60 minutes
            }
        },
        {
            "Skinny", new DurationTypeConfig
            {
                Name = "Skinny",
                Hours = 0.75m  // 45 minutes
            }
        }
    };

    /// <summary>
    /// Get the month range for a specific term slot.
    /// </summary>
    public static (int StartMonth, int EndMonth) GetTermSlotMonthRange(string termSlot)
    {
        return termSlot switch
        {
            "S1" => (1, 5),           // January - May
            "S2" => (6, 10),          // June - October
            "Q1" => (1, 3),           // January - March
            "Q2" => (4, 6),           // April - June
            "Q3" => (7, 9),           // July - September
            "Q4" => (10, 12),         // October - December
            "FullYear" => (1, 12),    // January - December
            _ => throw new ArgumentException($"Unknown term slot: {termSlot}")
        };
    }
}

/// <summary>
/// Configuration for a term (e.g., "Semester", "Quarter").
/// </summary>
public class TermConfig
{
    public required string Name { get; init; }
    public required int DurationMonths { get; init; }
    public required string[] Slots { get; init; }
}

/// <summary>
/// Configuration for a duration type (e.g., "Block", "Skinny").
/// </summary>
public class DurationTypeConfig
{
    public required string Name { get; init; }
    public required decimal Hours { get; init; }
}
