# ?? How to Add Real OHS Graduation Requirements

## Where to Update

The graduation requirements are in: **`SchoolScheduler.Data/PlanValidation.cs`**

Look for the `GraduationRequirements` class around line 60.

---

## Step 1: Get the Official Sheet

Ask your daughter's school for the **Graduation Requirements Sheet** they give out each year. It typically includes:

- Required credits by subject
- Total credits needed to graduate
- Recommended course sequences by grade
- College admission requirements

---

## Step 2: Update Required Credits

Replace the `RequiredCreditsByDepartment` dictionary with actual OHS requirements:

```csharp
public Dictionary<string, decimal> RequiredCreditsByDepartment { get; set; } = new()
{
    // UPDATE THESE WITH ACTUAL OHS REQUIREMENTS
    { "English", 4.0m },              // Example: 4 years required
    { "Math", 3.0m },                 // Example: 3 years required
    { "Science", 3.0m },              // Example: 3 years required
    { "Social Studies", 3.0m },       // Example: 3 years required
    { "Physical Education", 1.5m },   // Example: 1.5 credits required
    { "Health", 0.5m },               // Example: 0.5 credits required
    { "World Language", 2.0m },       // Example: 2 years (often for college, not graduation)
    { "Electives", 7.0m }             // Remaining credits
};
```

### How to Calculate Electives

Total Credits Required = Sum of all department credits

```
Electives = Total Required - (English + Math + Science + Social Studies + PE + Health + Language)
```

Example:
- Total: 24 credits
- Core subjects: 17 credits
- Electives: 24 - 17 = 7 credits

---

## Step 3: Update Recommended Courses by Grade

Replace the `RecommendedCoursesByGrade` with OHS's typical pathways:

```csharp
public Dictionary<int, List<string>> RecommendedCoursesByGrade { get; set; } = new()
{
    {
        9, new List<string>
        {
            // REPLACE WITH TYPICAL 9TH GRADE COURSES AT OHS
            "English 9",
            "Algebra 1 or Geometry",
            "Biology",
            "World History or Geography",
            "Spanish 1 (or other language)",
            "Physical Education",
            "Health (1 semester)",
            "Elective (Art, Music, Tech Ed, etc.)"
        }
    },
    {
        10, new List<string>
        {
            // REPLACE WITH TYPICAL 10TH GRADE COURSES
            "English 10",
            "Geometry or Algebra 2",
            "Chemistry",
            "US History or World History",
            "Spanish 2",
            "Physical Education",
            "Electives"
        }
    },
    // ... and so on for grades 11 and 12
};
```

---

## Step 4: Update Expected Credits by Grade

This helps students know if they're on track:

```csharp
public Dictionary<int, decimal> ExpectedCreditsByGrade { get; set; } = new()
{
    { 9, 6.0m },   // ~6 credits earned by end of freshman year
    { 10, 12.0m }, // ~12 credits total by end of sophomore year
    { 11, 18.0m }, // ~18 credits total by end of junior year
    { 12, 24.0m }  // 24 credits total to graduate
};
```

**How to Calculate:**
- Most students take 6-7 classes per year
- Block classes = 1 credit per year
- Skinny classes = 0.5 credits per semester = 0.25 credits per quarter

---

## Step 5: Update College Recommendations (Optional)

If OHS provides guidance for different college paths, update:

```csharp
public Dictionary<string, string> CollegeRecommendations { get; set; } = new()
{
    {
        "UW-Madison/Competitive",
        "4 years English, 4 years Math (through Pre-Calc or higher), " +
        "4 years Science (including lab sciences), 3-4 years Social Studies, " +
        "3-4 years World Language, multiple AP courses"
    },
    {
        "UW System/State Universities",
        "4 years English, 3-4 years Math, 3 years Science, " +
        "3 years Social Studies, 2-3 years World Language"
    },
    {
        "MATC/Technical College",
        "4 years English, 3 years Math, 2-3 years Science, " +
        "2-3 years Social Studies, career-focused electives"
    }
};
```

---

## Example: Real OHS Data

Once you have the sheet, your code might look like:

```csharp
// REAL OHS EXAMPLE (replace with actual data)
public Dictionary<string, decimal> RequiredCreditsByDepartment { get; set; } = new()
{
    { "English", 4.0m },              // English 9, 10, 11, 12
    { "Math", 3.0m },                 // Algebra 1, Geometry, Algebra 2
    { "Science", 3.0m },              // Biology, Chemistry, Physics/other
    { "Social Studies", 3.0m },       // World History, US History, Gov/Econ
    { "Physical Education", 1.5m },   // 1.5 credits over 4 years
    { "Health", 0.5m },               // 1 semester (usually 9th or 10th grade)
    { "Arts", 1.0m },                 // 1 year of Fine Arts or Performing Arts
    { "Career/Technical", 1.0m },     // 1 year of Career/Technical Education
    { "Electives", 7.0m }             // 24 total - 17 required = 7 electives
};

public decimal TotalCreditsRequired => 24.0m;
```

---

## How to Test Your Changes

1. **Rebuild the backend:**
   ```bash
   dotnet build
   ```

2. **Restart the API:**
   ```bash
   dotnet run --project SchoolScheduler.Api
   ```

3. **Test in the UI:**
   - Go to http://localhost:4200
   - Select some courses
   - Click "Validate Plan"
   - Look at the "Graduation Progress" section
   - Verify the requirements match the OHS sheet

---

## Tips for Getting the Data

### From School Website
- Check OHS guidance department page
- Look for "Student Handbook" or "Course Guide" PDFs
- Search for "graduation requirements"

### From Counselor
- Email or call the guidance office
- Ask for: "Graduation Requirements by Department"
- Request recommended 4-year plans for different paths

### From Your Daughter
- She likely has the sheet from orientation or registration
- Check her school portal (Skyward/PowerSchool)
- Look in her folders from last year's course selection

---

## Quick Update Checklist

- [ ] Get official OHS graduation requirements sheet
- [ ] Update `RequiredCreditsByDepartment` with actual credits
- [ ] Calculate correct `Electives` amount
- [ ] Update `RecommendedCoursesByGrade` for each grade (9-12)
- [ ] Verify `TotalCreditsRequired` matches OHS (usually 24)
- [ ] Update `ExpectedCreditsByGrade` based on typical student progress
- [ ] (Optional) Add OHS-specific `CollegeRecommendations`
- [ ] Rebuild and test

---

## Need Help?

If you have the OHS requirements sheet but aren't sure how to format it, just share:
1. Total credits required to graduate
2. Credits required by department
3. Any specific course sequences

I can help format it for the code! 

---

**Once updated with real OHS data, this will be super accurate and helpful for your daughter and her classmates!** ??
