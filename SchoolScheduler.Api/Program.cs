using System.IO;
using Microsoft.EntityFrameworkCore;
using MiniValidation;
using SchoolScheduler.Api;
using SchoolScheduler.Data;

var builder = WebApplication.CreateBuilder(args);

var dataSettingsPath = Path.Combine(AppContext.BaseDirectory,
    $"Data.appsettings.{builder.Environment.EnvironmentName}.json");

builder.Configuration.AddJsonFile(dataSettingsPath, optional: true, reloadOnChange: true);

var useInMemory = builder.Environment.IsDevelopment()
    || builder.Environment.IsEnvironment("Testing")
    || builder.Configuration.GetValue<bool>("Database:UseInMemory");

builder.Services.AddDbContext<SchedulerDbContext>(options =>
{
    if (useInMemory)
    {
        var dbName = builder.Configuration.GetValue<string>("Database:InMemoryDbName") ?? "SchedulerDevDb";
        options.UseInMemoryDatabase(dbName);
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

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

app.MapGet("/classes", async (SchedulerDbContext db) =>
    await db.Classes.ToListAsync());

app.MapPost("/classes", async (SchedulerDbContext db, ClassModel model) =>
{
    if (!MiniValidator.TryValidate(model, out var errors))
        return Results.ValidationProblem(errors);

    if (model.Id > 0)
    {
        // Update existing class
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
        // Add new class - create new instance without using request ID
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
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SchedulerDbContext>();
    if (useInMemory)
    {
        db.Database.EnsureCreated();
    }
    else
    {
        db.Database.Migrate();
    }
    DbSeeder.Seed(db);
}

// DELETE /classes/{id} - Delete a class
app.MapDelete("/classes/{id}", async (int id, SchedulerDbContext db) =>
{
    var classToDelete = await db.Classes.FindAsync(id);
    if (classToDelete == null)
        return Results.NotFound();
    
    db.Classes.Remove(classToDelete);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

// Make Program accessible to tests
public partial class Program { }
