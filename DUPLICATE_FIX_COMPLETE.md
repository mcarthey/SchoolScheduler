# ? DUPLICATE COURSE CODE FIX - READY TO START

## What Was Fixed

**Problem**: Course code `72507` appears 3 times in the CSV
- Digital Productions (Digital Communications)
- Digital Productions (English)
- Digital Productions (Technology & Engineering Education)

**Error**: `An item with the same key has already been added. Key: 72507`

**Solution**: Updated `CourseImportService.cs` to use `GroupBy` instead of `ToDictionary`

---

## The Cross-Listed Course

**"Digital Productions" (72507)** is intentionally listed in 3 departments because it fulfills requirements for multiple pathways.

This is a **feature**, not a bug! The fix now supports cross-listed courses properly.

---

## ?? START THE API NOW

```powershell
dotnet run --project SchoolScheduler.Api
```

---

## ? Expected Output (Success!)

```
?? Seeding courses from CSV...
?? Reading courses from: E:\Documents\dev\repos\SchoolScheduler\SchoolScheduler.Api\bin\Debug\net10.0\ohs-courses.csv
? Added 260 courses to database
? Linked prerequisites for all courses  ? Should work now!
Now listening on: https://localhost:7217
```

---

## ? What to Verify

### 1. Check Total Courses
**Swagger**: `https://localhost:7217/api/courses`
- **Expected**: 260 courses

### 2. Check Cross-Listed Course
**Search for "Digital Productions"**:
- **Expected**: 3 results (one per department)
- All should have code `72507`

### 3. Check Departments
**Angular**: `http://localhost:4200`
- **Expected**: 16 departments in dropdown

---

## ?? All Cross-Listed Courses

These courses appear in multiple departments:

| Course Code | Course Name | Departments |
|-------------|-------------|-------------|
| 72507 | Digital Productions | Digital Communications, English, Technology & Engineering |
| 72594 | Literature and Film Theory | Digital Communications, English, Technology & Engineering |
| 72520 | Seminar Digital Communications | Digital Communications, English, Technology & Engineering |
| 55068 | Dance | Performing Arts, Physical Education & Health |
| 55068S | Dance (Skinny) | Performing Arts, Physical Education & Health |
| 70700 | Industrial Design 1 | Technology & Engineering, Visual Arts & Design |
| 70702 | Industrial Design 2 | Technology & Engineering, Visual Arts & Design |

**Total unique courses**: 260 across all departments

---

## ?? Next Steps

1. **Start API**: `dotnet run --project SchoolScheduler.Api`
2. **Watch console** for success message
3. **Test Swagger**: Verify 260 courses
4. **Start Angular**: `cd scheduler-ui && npm start`
5. **Test UI**: Check departments and course counts

---

## ?? Technical Details

**File Changed**: `SchoolScheduler.Data/Services/CourseImportService.cs`

**Before** (crashed on duplicates):
```csharp
var coursesByCode = courses.ToDictionary(c => c.CourseCode ?? "", c => c);
```

**After** (handles duplicates):
```csharp
var coursesByCode = courses
    .GroupBy(c => c.CourseCode ?? "")
    .ToDictionary(g => g.Key, g => g.ToList());
```

**Why**: Cross-listed courses share the same code but exist in multiple departments.

---

**Everything is ready! Just run the API and watch for the success message!** ??
