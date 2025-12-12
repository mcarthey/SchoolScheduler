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
                StartDate = DateTime.Parse("2025-09-01"),
                EndDate = DateTime.Parse("2026-01-20"),
                MinutesPerSession = 80,
                Priority = 5
            });

            db.SaveChanges();
        }
    }
}
