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

    db.Classes.Add(model);
    await db.SaveChangesAsync();
    return Results.Created($"/classes/{model.Id}", model);
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

app.Run();

// Make Program accessible to tests
public partial class Program { }
