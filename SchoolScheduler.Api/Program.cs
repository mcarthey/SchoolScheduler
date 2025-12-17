using Microsoft.EntityFrameworkCore;
using MiniValidation;
using SchoolScheduler.Api;
using SchoolScheduler.Data;

var builder = WebApplication.CreateBuilder(args);

// Use SQLite for persistent storage (database file: scheduler.db)
builder.Services.AddDbContext<SchedulerDbContext>(options =>
{
    var dbPath = Path.Combine(Directory.GetCurrentDirectory(), "scheduler.db");
    options.UseSqlite($"Data Source={dbPath}");
});

// Register services
builder.Services.AddScoped<PlanValidator>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .WithOrigins("http://localhost:4200");
        });
});

var app = builder.Build();

app.UseCors("AllowAngular");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ===== LEGACY CLASS ENDPOINTS (keep for backward compatibility) =====
app.MapGet("/classes", async (SchedulerDbContext db) =>
    await db.Classes.ToListAsync())
    .WithTags("Legacy");

app.MapPost("/classes", async (SchedulerDbContext db, ClassModel model) =>
{
    if (!MiniValidator.TryValidate(model, out var errors))
        return Results.ValidationProblem(errors);

    if (model.Id > 0)
    {
        var existing = await db.Classes.FindAsync(model.Id);
        if (existing == null)
            return Results.NotFound();
        
        existing.Name = model.Name;
        existing.Term = model.Term;
        existing.TermSlot = model.TermSlot;
        existing.DurationType = model.DurationType;
        existing.Priority = model.Priority;
        
        await db.SaveChangesAsync();
        return Results.Ok(existing);
    }
    else
    {
        var newClass = new ClassModel
        {
            Name = model.Name,
            Term = model.Term,
            TermSlot = model.TermSlot,
            DurationType = model.DurationType,
            Priority = model.Priority
        };
        db.Classes.Add(newClass);
        await db.SaveChangesAsync();
        return Results.Created($"/classes/{newClass.Id}", newClass);
    }
})
.WithTags("Legacy");

app.MapDelete("/classes/{id}", async (int id, SchedulerDbContext db) =>
{
    var classToDelete = await db.Classes.FindAsync(id);
    if (classToDelete == null)
        return Results.NotFound();
    
    db.Classes.Remove(classToDelete);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithTags("Legacy");

// ===== COURSE CATALOG ENDPOINTS =====
app.MapGet("/api/courses", async (SchedulerDbContext db) =>
    await db.Courses.ToListAsync())
    .WithName("GetCourses")
    .WithTags("Courses")
    .Produces<List<Course>>(200);

app.MapGet("/api/courses/{id}", async (int id, SchedulerDbContext db) =>
{
    var course = await db.Courses.FindAsync(id);
    return course is not null ? Results.Ok(course) : Results.NotFound();
})
.WithName("GetCourse")
.WithTags("Courses")
.Produces<Course>(200)
.Produces(404);

app.MapGet("/api/courses/department/{department}", async (string department, SchedulerDbContext db) =>
{
    var courses = await db.Courses
        .Where(c => c.Department == department)
        .ToListAsync();
    return Results.Ok(courses);
})
.WithName("GetCoursesByDepartment")
.WithTags("Courses")
.Produces<List<Course>>(200);

app.MapGet("/api/courses/grade/{gradeLevel}", async (int gradeLevel, SchedulerDbContext db) =>
{
    var courses = await db.Courses
        .Where(c => c.GradeLevels.Contains(gradeLevel))
        .ToListAsync();
    return Results.Ok(courses);
})
.WithName("GetCoursesByGrade")
.WithTags("Courses")
.Produces<List<Course>>(200);

// ===== STUDENT PLAN ENDPOINTS =====
app.MapGet("/api/plans", async (SchedulerDbContext db) =>
    await db.StudentPlans.ToListAsync())
    .WithName("GetPlans")
    .WithTags("Plans")
    .Produces<List<StudentPlan>>(200);

app.MapGet("/api/plans/{id}", async (int id, SchedulerDbContext db) =>
{
    var plan = await db.StudentPlans.FindAsync(id);
    return plan is not null ? Results.Ok(plan) : Results.NotFound();
})
.WithName("GetPlan")
.WithTags("Plans")
.Produces<StudentPlan>(200)
.Produces(404);

app.MapPost("/api/plans", async (SchedulerDbContext db, StudentPlan plan) =>
{
    if (!MiniValidator.TryValidate(plan, out var errors))
        return Results.ValidationProblem(errors);

    plan.CreatedAt = DateTime.UtcNow;
    plan.UpdatedAt = DateTime.UtcNow;
    
    db.StudentPlans.Add(plan);
    await db.SaveChangesAsync();
    
    return Results.Created($"/api/plans/{plan.Id}", plan);
})
.WithName("CreatePlan")
.WithTags("Plans")
.Produces<StudentPlan>(201)
.Produces(400);

app.MapPut("/api/plans/{id}", async (int id, SchedulerDbContext db, StudentPlan inputPlan) =>
{
    var plan = await db.StudentPlans.FindAsync(id);
    if (plan is null)
        return Results.NotFound();

    if (!MiniValidator.TryValidate(inputPlan, out var errors))
        return Results.ValidationProblem(errors);

    plan.StudentName = inputPlan.StudentName;
    plan.GradeLevel = inputPlan.GradeLevel;
    plan.SchoolYear = inputPlan.SchoolYear;
    plan.SelectedCourseIds = inputPlan.SelectedCourseIds;
    plan.Notes = inputPlan.Notes;
    plan.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(plan);
})
.WithName("UpdatePlan")
.WithTags("Plans")
.Produces<StudentPlan>(200)
.Produces(404)
.Produces(400);

app.MapDelete("/api/plans/{id}", async (int id, SchedulerDbContext db) =>
{
    var plan = await db.StudentPlans.FindAsync(id);
    if (plan is null)
        return Results.NotFound();
    
    db.StudentPlans.Remove(plan);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("DeletePlan")
.WithTags("Plans")
.Produces(204)
.Produces(404);

// ===== PLAN VALIDATION ENDPOINT =====
app.MapPost("/api/plans/validate", async (SchedulerDbContext db, PlanValidator validator, StudentPlan plan) =>
{
    var allCourses = await db.Courses.ToListAsync();
    var result = validator.Validate(plan, allCourses);
    return Results.Ok(result);
})
.WithName("ValidatePlan")
.WithTags("Plans")
.Produces<PlanValidationResult>(200);

// ===== GRADUATION REQUIREMENTS ENDPOINT =====
app.MapGet("/api/graduation-requirements", () =>
{
    var requirements = new GraduationRequirements();
    return Results.Ok(requirements);
})
.WithName("GetGraduationRequirements")
.WithTags("Graduation")
.Produces<GraduationRequirements>(200);

app.MapGet("/api/graduation-requirements/recommendations/{gradeLevel}", (int gradeLevel) =>
{
    var requirements = new GraduationRequirements();
    
    if (!requirements.RecommendedCoursesByGrade.ContainsKey(gradeLevel))
        return Results.NotFound();
    
    return Results.Ok(new
    {
        GradeLevel = gradeLevel,
        RecommendedCourses = requirements.RecommendedCoursesByGrade[gradeLevel],
        ExpectedCredits = requirements.ExpectedCreditsByGrade[gradeLevel]
    });
})
.WithName("GetRecommendations")
.WithTags("Graduation")
.Produces(200)
.Produces(404);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SchedulerDbContext>();
    
    // Ensure database is created and migrations applied
    db.Database.EnsureCreated();
    
    // Seed data only if empty
    DbSeeder.Seed(db);
}

app.Run();

// Make Program accessible to tests
public partial class Program { }
