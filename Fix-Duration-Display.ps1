# Fix Duration Display - Shows Correct "Semester" Instead of "Full Year"

Write-Host "?? Fixing Course Duration Display..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Delete old database with wrong durations
Write-Host "1. Deleting old database..." -ForegroundColor Yellow
if (Test-Path "SchoolScheduler.Api\scheduler.db") {
    Remove-Item "SchoolScheduler.Api\scheduler.db" -Force
    Remove-Item "SchoolScheduler.Api\scheduler.db-shm" -Force -ErrorAction SilentlyContinue
    Remove-Item "SchoolScheduler.Api\scheduler.db-wal" -Force -ErrorAction SilentlyContinue
    Write-Host "   ? Old database deleted" -ForegroundColor Green
} else {
    Write-Host "   (No database found - will create new one)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Now restart the API to reload courses with corrected durations:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   In Visual Studio:" -ForegroundColor White
Write-Host "   - Stop API (Shift+F5 or Stop button)" -ForegroundColor Gray
Write-Host "   - Start API (F5 or Start button)" -ForegroundColor Gray
Write-Host ""
Write-Host "   OR in PowerShell:" -ForegroundColor White
Write-Host "   dotnet run --project SchoolScheduler.Api" -ForegroundColor Gray
Write-Host ""

Write-Host "? Ready to test!" -ForegroundColor Green
Write-Host ""
Write-Host "What your daughter will see:" -ForegroundColor Cyan
Write-Host "  BEFORE: Advertising and Design | Full Year | 0.5 cr ?" -ForegroundColor Red
Write-Host "  AFTER:  Advertising and Design | Semester  | 0.5 cr ?" -ForegroundColor Green
Write-Host ""
Write-Host "  BEFORE: Painting 1 | Full Year | 0.5 cr ?" -ForegroundColor Red
Write-Host "  AFTER:  Painting 1 | Semester  | 0.5 cr ?" -ForegroundColor Green
Write-Host ""
Write-Host "  AP Calculus BC | 2-Year Course | 2 cr ? (double credit!)" -ForegroundColor Magenta
Write-Host ""
