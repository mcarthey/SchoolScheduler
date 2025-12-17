# ? IMMEDIATE FIX - Restart API with Updated Code

## Current Problem

Your API is **still running the old code** that crashes on duplicate course codes.

Look at your stack trace - line 60 is still using `ToDictionary` (the old buggy code):
```
at SchoolScheduler.Data.Services.CourseImportService.LinkPrerequisites(List`1 courses, String filePath) 
   in E:\Documents\dev\repos\SchoolScheduler\SchoolScheduler.Data\Services\CourseImportService.cs:line 60
```

But we **already fixed this** to use `GroupBy` instead!

---

## Solution: Stop + Rebuild + Restart API

### Step 1: Stop the API
- In the API terminal/console, press **Ctrl+C**
- OR in Visual Studio, press **Shift+F5**
- OR close the terminal window

### Step 2: Delete Old Database
```powershell
Remove-Item SchoolScheduler.Api\bin\Debug\net10.0\scheduler.db* -Force
```

### Step 3: Rebuild
```powershell
dotnet clean SchoolScheduler.Api
dotnet build SchoolScheduler.Api
```

### Step 4: Restart API
```powershell
dotnet run --project SchoolScheduler.Api
```

---

## ? Expected Output (Success!)

```
?? Seeding courses from CSV...
?? Reading courses from: ...ohs-courses.csv
? Added 260 courses to database
? Linked prerequisites for all courses  ? Should succeed now!
Now listening on: https://localhost:7217
```

**NOT this:**
```
? Error importing CSV: An item with the same key has already been added
   Using fallback sample data instead.
```

---

## Why This Happened

1. ? You edited `CourseImportService.cs` (fix applied)
2. ? You ran `dotnet build` (code compiled)
3. ? API was still running with **old DLL in memory**
4. ? New code never got loaded

**Rule**: After changing .NET code, you **must restart the process** to load the new DLL!

---

## Quick Commands (Copy-Paste)

```powershell
# Stop API (Ctrl+C in terminal)
# Then run these:

Remove-Item SchoolScheduler.Api\bin\Debug\net10.0\scheduler.db -Force -ErrorAction SilentlyContinue
dotnet build SchoolScheduler.Api
dotnet run --project SchoolScheduler.Api
```

---

## Verification

Watch the console output. You should see:

```
? Added 260 courses to database
? Linked prerequisites for all courses
```

Then test Swagger:
- Open: `https://localhost:7217/api/courses`
- Should return **260 courses** (not 17!)
- Search for "Digital Productions" ? **3 results**

---

## About the npm Warning

The warning `'npm' is not recognized` is harmless. It's from the XelloScraper project trying to run `npm install` during build.

You can ignore it OR fix it by adding npm to your PATH:
1. Find npm location (usually `C:\Program Files\nodejs\`)
2. Add to System PATH environment variable
3. Restart Visual Studio

But it's **not blocking anything** - Angular runs fine independently!

---

**Stop the API now and run those commands!** ??
