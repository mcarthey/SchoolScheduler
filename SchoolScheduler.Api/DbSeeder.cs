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
                TermSlot = "S1",
                DurationType = "Block",
                Priority = 5
            });

            db.SaveChanges();
        }
    }
}
