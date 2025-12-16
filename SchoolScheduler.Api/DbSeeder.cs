using SchoolScheduler.Data;

namespace SchoolScheduler.Api;

public static class DbSeeder
{
    public static void Seed(SchedulerDbContext db)
    {
        // Seed legacy ClassModel data
        if (!db.Classes.Any())
        {
            db.Classes.Add(new ClassModel
            {
                Name = "English 10",
                Term = "Semester",
                TermSlot = "S1",
                DurationType = "Block",
                Priority = 5
            });

            db.SaveChanges();
        }

        // Seed new Course catalog
        CourseSeeder.SeedCourses(db);
    }
}
