using Microsoft.EntityFrameworkCore;

namespace SchoolScheduler.Data;

public class SchedulerDbContext : DbContext
{
    public SchedulerDbContext(DbContextOptions<SchedulerDbContext> options)
        : base(options) { }

    public DbSet<ClassModel> Classes => Set<ClassModel>();
}
