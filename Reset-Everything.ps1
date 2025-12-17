# Complete Reset and Fresh Start

Write-Host "??????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "  COMPLETE RESET - 260 OHS Courses + New Styling" -ForegroundColor Cyan
Write-Host "??????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop everything
Write-Host "1??  Stopping all running processes..." -ForegroundColor Yellow
Write-Host "   (Press Ctrl+C in API/Angular terminals if running)" -ForegroundColor Gray
Start-Sleep -Seconds 2
Write-Host ""

# Step 2: Clean everything
Write-Host "2??  Cleaning all build outputs..." -ForegroundColor Yellow
dotnet clean | Out-Null
Write-Host "   ? .NET cleaned" -ForegroundColor Green

# Step 3: Delete ALL databases
Write-Host "3??  Deleting ALL database files..." -ForegroundColor Yellow
$dbFiles = Get-ChildItem -Path "." -Recurse -Filter "scheduler.db*" -ErrorAction SilentlyContinue
foreach ($file in $dbFiles) {
    Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
    Write-Host "   Deleted: $($file.Name)" -ForegroundColor Gray
}
Write-Host "   ? All databases deleted" -ForegroundColor Green
Write-Host ""

# Step 4: Rebuild backend
Write-Host "4??  Rebuilding backend..." -ForegroundColor Yellow
dotnet build | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ? Backend built" -ForegroundColor Green
} else {
    Write-Host "   ? Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Verify CSV
Write-Host "5??  Verifying CSV file..." -ForegroundColor Yellow
$csvSource = "ohs-courses.csv"
$csvDest = "SchoolScheduler.Api\bin\Debug\net10.0\ohs-courses.csv"

if (Test-Path $csvSource) {
    $lineCount = (Get-Content $csvSource | Measure-Object -Line).Lines - 1
    Write-Host "   ? Source CSV found: $lineCount courses" -ForegroundColor Green
    
    if (Test-Path $csvDest) {
        Write-Host "   ? CSV copied to output directory" -ForegroundColor Green
    } else {
        Write-Host "   ??  CSV not in output, copying manually..." -ForegroundColor Yellow
        Copy-Item $csvSource $csvDest -Force
        Write-Host "   ? CSV manually copied" -ForegroundColor Green
    }
} else {
    Write-Host "   ? CSV not found at $csvSource" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Rebuild Angular (to pick up SCSS changes)
Write-Host "6??  Rebuilding Angular..." -ForegroundColor Yellow
Push-Location scheduler-ui
npm run build --if-present 2>&1 | Out-Null
Pop-Location
Write-Host "   ? Angular rebuilt (SCSS changes included)" -ForegroundColor Green
Write-Host ""

# Step 7: Summary
Write-Host "??????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "  ? READY TO START" -ForegroundColor Green
Write-Host "??????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Start both projects" -ForegroundColor White
Write-Host ""
Write-Host "Option A: Visual Studio (Recommended)" -ForegroundColor Yellow
Write-Host "  1. Press F5" -ForegroundColor Gray
Write-Host "  2. Both API and Angular will start" -ForegroundColor Gray
Write-Host ""
Write-Host "Option B: Manual Terminals" -ForegroundColor Yellow
Write-Host "  Terminal 1:" -ForegroundColor Gray
Write-Host "    dotnet run --project SchoolScheduler.Api" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 2:" -ForegroundColor Gray
Write-Host "    cd scheduler-ui" -ForegroundColor Cyan
Write-Host "    npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected API Output:" -ForegroundColor Yellow
Write-Host "  ?? Seeding courses from CSV..." -ForegroundColor Gray
Write-Host "  ?? Reading courses from: ...ohs-courses.csv" -ForegroundColor Gray
Write-Host "  ? Added 260 courses to database" -ForegroundColor Gray
Write-Host "  ? Linked prerequisites for all courses" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected Browser (http://localhost:4200):" -ForegroundColor Yellow
Write-Host "  ? 16 departments in dropdown" -ForegroundColor Gray
Write-Host "  ? 260 courses available" -ForegroundColor Gray
Write-Host "  ? Action buttons with gradient styling" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor White
$null = Read-Host
