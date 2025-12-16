using SchoolScheduler.Data;

namespace SchoolScheduler.Api;

public static class DbSeeder
{
    public static void Seed(SchedulerDbContext db)
    {
        if (!db.Classes.Any())
        {
            db.Classes.Add(new ClassModel
            {
                Name = "English 10",
                Term = "Semester",
                DurationType = "Block",
                StartTime = "09:00",
                DaysOfWeek = new[] { 1, 3, 5 }, // Monday, Wednesday, Friday
                Priority = 5
            });

            db.SaveChanges();
        }
    }
}
