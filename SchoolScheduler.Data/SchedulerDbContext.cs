using Microsoft.EntityFrameworkCore;

namespace SchoolScheduler.Data;

public class SchedulerDbContext : DbContext
{
    public SchedulerDbContext(DbContextOptions<SchedulerDbContext> options)
        : base(options) { }

    // Legacy - keep for backward compatibility during transition
    public DbSet<ClassModel> Classes => Set<ClassModel>();
    
    // New course planning models
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<StudentPlan> StudentPlans => Set<StudentPlan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Course entity
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasIndex(e => e.CourseCode);
            entity.HasIndex(e => e.Department);
            entity.Property(e => e.GradeLevels).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray()
            );
            entity.Property(e => e.PrerequisiteIds).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray()
            );
        });

        // Configure StudentPlan entity
        modelBuilder.Entity<StudentPlan>(entity =>
        {
            entity.HasIndex(e => e.StudentName);
            entity.HasIndex(e => e.GradeLevel);
            entity.Property(e => e.SelectedCourseIds).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray()
            );
        });
    }
}
