using SchoolScheduler.Data;
using System.Globalization;
using CsvHelper;

namespace SchoolScheduler.Data.Services;

public class CourseImportService
{
    public class CourseCsvRecord
    {
        public string CourseCode { get; set; } = "";
        public string CourseName { get; set; } = "";
        public string Department { get; set; } = "";
        public string Duration { get; set; } = "";
        public string BlockType { get; set; } = "";
        public decimal Credits { get; set; }
        public string GradeLevels { get; set; } = "";
        public string Prerequisites { get; set; } = "";
        public bool IsAdvanced { get; set; }
        public string Description { get; set; } = "";
        public int PeriodsRequired { get; set; }
        public int WorkloadLevel { get; set; }
    }

    public static List<Course> ImportFromCsv(string filePath)
    {
        var courses = new List<Course>();

        using var reader = new StreamReader(filePath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        
        var records = csv.GetRecords<CourseCsvRecord>();

        foreach (var record in records)
        {
            // Determine actual duration from credits (more reliable than Duration field)
            var actualDuration = DetermineDurationFromCredits(record.Credits, record.Duration);
            
            var course = new Course
            {
                Name = record.CourseName,
                CourseCode = record.CourseCode,
                Department = record.Department,
                Duration = actualDuration,
                BlockType = record.BlockType,
                Credits = record.Credits,
                GradeLevels = ParseGradeLevels(record.GradeLevels).ToArray(),
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = record.IsAdvanced,
                Description = record.Description,
                PeriodsRequired = record.PeriodsRequired,
                WorkloadLevel = record.WorkloadLevel
            };

            courses.Add(course);
        }

        return courses;
    }

    public static void LinkPrerequisites(List<Course> courses, string filePath)
    {
        // Create a lookup for courses by code (supports multiple courses per code)
        var coursesByCode = courses
            .GroupBy(c => c.CourseCode ?? "")
            .ToDictionary(g => g.Key, g => g.ToList());

        using var reader = new StreamReader(filePath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        
        var records = csv.GetRecords<CourseCsvRecord>().ToList();

        // Process each unique course code from CSV (handle duplicates)
        foreach (var courseCode in coursesByCode.Keys)
        {
            // Find all CSV records with this course code
            var recordsForCode = records.Where(r => r.CourseCode == courseCode).ToList();
            if (!recordsForCode.Any()) continue;

            // Use the first record's prerequisites (they should all be the same for same course code)
            var firstRecord = recordsForCode.First();
            if (string.IsNullOrWhiteSpace(firstRecord.Prerequisites)) continue;

            // Find all courses with this course code
            if (!coursesByCode.TryGetValue(courseCode, out var coursesWithCode)) continue;

            // Parse prerequisite codes
            var prereqCodes = firstRecord.Prerequisites
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(p => p.Trim())
                .ToList();

            // Link to prerequisite course IDs for ALL courses with this code
            foreach (var course in coursesWithCode)
            {
                var prereqIds = new List<int>();
                foreach (var prereqCode in prereqCodes)
                {
                    if (coursesByCode.TryGetValue(prereqCode, out var prereqCourses))
                    {
                        // Add all matching prerequisite course IDs
                        prereqIds.AddRange(prereqCourses.Where(c => c.Id > 0).Select(c => c.Id));
                    }
                }
                
                if (prereqIds.Any())
                {
                    course.PrerequisiteIds = prereqIds.Distinct().ToArray();
                }
            }
        }
    }

    private static List<int> ParseGradeLevels(string gradeLevels)
    {
        if (string.IsNullOrWhiteSpace(gradeLevels))
            return new List<int>();

        return gradeLevels
            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(g => g.Trim())
            .Where(g => int.TryParse(g, out _))
            .Select(int.Parse)
            .ToList();
    }

    private static string DetermineDurationFromCredits(decimal credits, string csvDuration)
    {
        // Use credits to determine actual duration (more accurate than CSV Duration field)
        // OHS gives 0.5 credits per semester, 1.0 for full year
        
        return credits switch
        {
            0.5m => "Semester",           // Half year
            1.0m => "Full Year",          // Full year
            1.5m => "3 Semesters",        // Unusual: year and a half
            2.0m => "2-Year Course",      // Double credit or 2-year program
            _ => csvDuration              // Fallback to CSV value if unusual credit amount
        };
    }
}
