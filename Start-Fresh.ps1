# ?? Quick Start Script - Load All 260 OHS Courses

Write-Host "???????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "  OHS Course Planner - Fresh Start with 260 Courses" -ForegroundColor Cyan
Write-Host "???????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean everything
Write-Host "1??  Cleaning old builds..." -ForegroundColor Yellow
dotnet clean | Out-Null
Write-Host "   ? Cleaned" -ForegroundColor Green
Write-Host ""

# Step 2: Delete all database files
Write-Host "2??  Deleting old databases..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Recurse -Filter "scheduler.db*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "   ? Databases deleted" -ForegroundColor Green
Write-Host ""

# Step 3: Rebuild solution
Write-Host "3??  Rebuilding solution..." -ForegroundColor Yellow
dotnet build | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ? Build successful" -ForegroundColor Green
} else {
    Write-Host "   ? Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Verify CSV exists
Write-Host "4??  Checking for ohs-courses.csv..." -ForegroundColor Yellow
$csvPath = "SchoolScheduler.Api\bin\Debug\net10.0\ohs-courses.csv"
if (Test-Path $csvPath) {
    $lineCount = (Get-Content "ohs-courses.csv" | Measure-Object -Line).Lines - 1
    Write-Host "   ? CSV found with $lineCount courses" -ForegroundColor Green
} else {
    Write-Host "   ? CSV not found at $csvPath" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Instructions
Write-Host "???????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "  Ready to Start!" -ForegroundColor Cyan
Write-Host "???????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "  1. Press F5 in Visual Studio (or run commands below)" -ForegroundColor White
Write-Host "  2. API will start at: https://localhost:7217" -ForegroundColor White
Write-Host "  3. Angular will start at: http://localhost:4200" -ForegroundColor White
Write-Host ""
Write-Host "Watch API Console for:" -ForegroundColor Yellow
Write-Host "  ?? Seeding courses from CSV..." -ForegroundColor Gray
Write-Host "  ?? Reading courses from: ...ohs-courses.csv" -ForegroundColor Gray
Write-Host "  ? Added 260 courses to database" -ForegroundColor Gray
Write-Host "  ? Linked prerequisites for all courses" -ForegroundColor Gray
Write-Host ""
Write-Host "Or run manually:" -ForegroundColor White
Write-Host "  dotnet run --project SchoolScheduler.Api" -ForegroundColor Cyan
Write-Host "  cd scheduler-ui; npm start" -ForegroundColor Cyan
Write-Host ""
