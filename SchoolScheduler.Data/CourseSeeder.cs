using SchoolScheduler.Data;
using SchoolScheduler.Data.Services;

namespace SchoolScheduler.Data;

public static class CourseSeeder
{
    public static void SeedCourses(SchedulerDbContext db)
    {
        if (db.Courses.Any())
        {
            Console.WriteLine("? Courses already seeded.");
            return;
        }

        Console.WriteLine("?? Seeding courses from CSV...");

        try
        {
            // Path to the CSV file - try multiple locations
            var possiblePaths = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "ohs-courses.csv"),
                Path.Combine(AppContext.BaseDirectory, "ohs-courses.csv"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "ohs-courses.csv"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "ohs-courses.csv")
            };

            string? csvPath = null;
            foreach (var path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    csvPath = path;
                    break;
                }
            }

            if (csvPath == null)
            {
                Console.WriteLine($"??  CSV file not found in any of these locations:");
                foreach (var path in possiblePaths)
                {
                    Console.WriteLine($"   - {path}");
                }
                Console.WriteLine("   Using fallback sample data instead.");
                SeedSampleCourses(db);
                return;
            }

            Console.WriteLine($"?? Reading courses from: {csvPath}");

            // Import courses from CSV
            var courses = CourseImportService.ImportFromCsv(csvPath);

            // Add courses to database
            db.Courses.AddRange(courses);
            db.SaveChanges();

            Console.WriteLine($"? Added {courses.Count} courses to database");

            // Now link prerequisites (requires course IDs to be generated)
            CourseImportService.LinkPrerequisites(courses, csvPath);
            db.SaveChanges();

            Console.WriteLine($"? Linked prerequisites for all courses");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"? Error importing CSV: {ex.Message}");
            Console.WriteLine($"   Stack trace: {ex.StackTrace}");
            Console.WriteLine("   Using fallback sample data instead.");
            SeedSampleCourses(db);
        }
    }

    private static void SeedSampleCourses(SchedulerDbContext db)
    {
        Console.WriteLine("?? Seeding sample courses...");

        var courses = new List<Course>
        {
            // ===== ENGLISH =====
            new Course
            {
                Name = "English 9",
                CourseCode = "ENG9",
                Department = "English",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                Description = "Foundational English course covering literature, writing, and communication skills.",
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "English 10",
                CourseCode = "ENG10",
                Department = "English",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 10 },
                PrerequisiteIds = Array.Empty<int>(), // Would reference ENG9 in real data
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "AP English Language",
                CourseCode = "APENG11",
                Department = "English",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = true,
                Description = "College-level rhetoric and composition course. Prepares for AP exam.",
                PeriodsRequired = 1,
                WorkloadLevel = 5
            },

            // ===== MATH =====
            new Course
            {
                Name = "Algebra 1",
                CourseCode = "MATH9",
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
                Name = "Geometry",
                CourseCode = "MATHGEO",
                Department = "Math",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9, 10, 11 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "AP Calculus AB",
                CourseCode = "APCALC",
                Department = "Math",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = true,
                Description = "College-level calculus. Prepares for AP exam.",
                PeriodsRequired = 1,
                WorkloadLevel = 5
            },

            // ===== SCIENCE =====
            new Course
            {
                Name = "Biology",
                CourseCode = "SCI9BIO",
                Department = "Science",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                Description = "Introduction to life sciences with lab component.",
                PeriodsRequired = 2, // Double-block for lab
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "Chemistry",
                CourseCode = "SCI10CHEM",
                Department = "Science",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 10, 11 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 2,
                WorkloadLevel = 4
            },
            new Course
            {
                Name = "AP Biology",
                CourseCode = "APBIO",
                Department = "Science",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = true,
                PeriodsRequired = 2,
                WorkloadLevel = 5
            },

            // ===== SOCIAL STUDIES =====
            new Course
            {
                Name = "World History",
                CourseCode = "SS9WH",
                Department = "Social Studies",
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
                Name = "US History",
                CourseCode = "SS11USH",
                Department = "Social Studies",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "AP US History",
                CourseCode = "APUSH",
                Department = "Social Studies",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = true,
                PeriodsRequired = 1,
                WorkloadLevel = 5
            },

            // ===== ELECTIVES =====
            new Course
            {
                Name = "Spanish 1",
                CourseCode = "SPAN1",
                Department = "World Language",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9, 10, 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "Spanish 2",
                CourseCode = "SPAN2",
                Department = "World Language",
                Duration = "Full Year",
                BlockType = "Block",
                Credits = 1.0m,
                GradeLevels = new[] { 9, 10, 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 3
            },
            new Course
            {
                Name = "Art 1 - Drawing & Painting",
                CourseCode = "ART1",
                Department = "Art",
                Duration = "Semester 1",
                BlockType = "Block",
                Credits = 0.5m,
                GradeLevels = new[] { 9, 10, 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 2
            },
            new Course
            {
                Name = "Physical Education",
                CourseCode = "PE9",
                Department = "Physical Education",
                Duration = "Semester 1",
                BlockType = "Skinny",
                Credits = 0.25m,
                GradeLevels = new[] { 9, 10, 11, 12 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 1
            },
            new Course
            {
                Name = "Health",
                CourseCode = "HEALTH",
                Department = "Health",
                Duration = "Semester 1",
                BlockType = "Skinny",
                Credits = 0.5m,
                GradeLevels = new[] { 9, 10 },
                PrerequisiteIds = Array.Empty<int>(),
                IsAdvanced = false,
                PeriodsRequired = 1,
                WorkloadLevel = 2
            }
        };

        db.Courses.AddRange(courses);
        db.SaveChanges();
    }
}
