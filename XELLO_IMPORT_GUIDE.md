# Importing Real OHS Course Data from Xello

## Quick Start

Since the Xello course guide requires login, here's how to get the real data into the app:

### Option 1: Manual CSV Import (Recommended)

1. **Export from Xello**:
   - Go to https://educator.xello.world/course-guide/d15fff78-6def-4cc6-8ffc-ce1cd06fb4f7
   - If you can export to CSV/Excel, download it
   - If not, we'll create a CSV manually from the visible data

2. **Create CSV File**:
   Create a file `ohs-courses.csv` with this format:
   
   ```csv
   CourseCode,CourseName,Department,Duration,BlockType,Credits,GradeLevels,Prerequisites,IsAdvanced,Description,PeriodsRequired,WorkloadLevel
   ENG0900,English 9,"English","Full Year","Block",1.0,"9","",false,"Foundational English course",1,3
   ```

3. **Use the Import Tool**:
   ```bash
   # I'll create an import endpoint for you
   POST /api/courses/import
   ```

---

### Option 2: Quick Data Entry

If you just want to test with a few real courses, here's what I need from the Xello page:

**For each course, tell me:**
1. Course Code (like "ENG0900")
2. Course Name (like "English 9")
3. Department (English, Math, Science, etc.)
4. Duration (Full Year, Semester 1, Semester 2, Quarter 1-4)
5. Block Type (Block 85min or Skinny 40min)
6. Credits (0.5, 1.0, etc.)
7. Grade Levels (9, 10, 11, 12)
8. Prerequisites (if any)
9. Is it AP/Honors? (yes/no)

**Example from Xello:**
```
Course: AP English Language & Composition
Code: APENL11
Department: English
Duration: Full Year
Type: Block (85 min)
Credits: 1.0
Grades: 11, 12
Prerequisite: English 10 or recommendation
AP: Yes
```

---

### Option 3: Screen Share/Screenshot

If you can show me a screenshot of 10-20 courses from the Xello page, I can manually enter them into the seeder.

---

## CSV Template

Save this as `ohs-courses-template.csv`:

```csv
CourseCode,CourseName,Department,Duration,BlockType,Credits,GradeLevels,Prerequisites,IsAdvanced,Description,PeriodsRequired,WorkloadLevel
ENG0900,English 9,English,Full Year,Block,1.0,9,,false,"Core English course for freshmen focusing on literature and composition",1,3
ENG1000,English 10,English,Full Year,Block,1.0,10,ENG0900,false,"Continuation of English studies with emphasis on world literature",1,3
APENL11,AP English Language,English,Full Year,Block,1.0,"11,12",ENG1000,true,"College-level rhetoric and composition course preparing for AP exam",1,5
MTH0900,Algebra 1,Math,Full Year,Block,1.0,"9,10",,false,"Introduction to algebraic concepts and problem solving",1,3
MTH1000,Geometry,Math,Full Year,Block,1.0,"9,10,11",MTH0900,false,"Study of geometric shapes, proofs, and spatial reasoning",1,3
MTH1100,Algebra 2,Math,Full Year,Block,1.0,"10,11",MTH1000,false,"Advanced algebraic concepts and functions",1,4
APCALC,AP Calculus AB,Math,Full Year,Block,1.0,"11,12",MTH1100,true,"College-level calculus preparing for AP exam",1,5
SCI0900,Biology,Science,Full Year,Block,1.0,9,,false,"Introduction to life sciences with lab component",2,3
SCI1000,Chemistry,Science,Full Year,Block,1.0,"10,11",SCI0900,false,"Study of matter, chemical reactions, and lab experiments",2,4
APBIO,AP Biology,Science,Full Year,Block,1.0,"11,12",SCI0900,true,"College-level biology with intensive lab work",2,5
SS0900,World History,Social Studies,Full Year,Block,1.0,9,,false,"Survey of world civilizations and cultures",1,3
SS1100,US History,Social Studies,Full Year,Block,1.0,11,,false,"Study of American history from colonization to present",1,3
APUSH,AP US History,Social Studies,Full Year,Block,1.0,"11,12",SS0900,true,"College-level US history preparing for AP exam",1,5
WL_SPN1,Spanish 1,World Language,Full Year,Block,1.0,"9,10,11,12",,false,"Introduction to Spanish language and culture",1,3
WL_SPN2,Spanish 2,World Language,Full Year,Block,1.0,"9,10,11,12",WL_SPN1,false,"Continuation of Spanish language studies",1,3
PE0900,Physical Education,Physical Education,Semester 1,Skinny,0.25,"9,10,11,12",,false,"Physical fitness and sports activities",1,1
HEALTH,Health,Health,Semester 1,Skinny,0.5,"9,10",,false,"Personal health and wellness education",1,2
ART1,Art 1,Art,Semester 1,Block,0.5,"9,10,11,12",,false,"Introduction to drawing and painting techniques",1,2
```

---

## How to Use This Template

1. **Fill in your data**: Replace the sample courses with real OHS courses
2. **Save the file**: Save as `ohs-courses.csv` in the project root
3. **Run import**: I'll create an import tool that reads this file

---

## Fields Explained

| Field | Description | Example Values |
|-------|-------------|----------------|
| CourseCode | School's course code | "ENG0900", "APCALC" |
| CourseName | Full course name | "English 9", "AP Calculus AB" |
| Department | Subject area | English, Math, Science, Social Studies, etc. |
| Duration | When course runs | "Full Year", "Semester 1", "Semester 2", "Quarter 1" |
| BlockType | Class length | "Block" (85 min) or "Skinny" (40 min) |
| Credits | Credits earned | 0.25, 0.5, 1.0, 1.5 |
| GradeLevels | Eligible grades | "9" or "9,10,11,12" (comma-separated) |
| Prerequisites | Required course codes | "" (empty) or "ENG0900" or "MTH0900,MTH1000" |
| IsAdvanced | AP/Honors flag | true or false |
| Description | Course description | "Study of..." |
| PeriodsRequired | Periods per day | 1 (normal) or 2 (double-block science) |
| WorkloadLevel | Difficulty 1-5 | 1=easy, 3=normal, 5=very hard (AP) |

---

## Next Steps

**Tell me which option you prefer:**
1. Send me a CSV file (I'll process it)
2. Give me 10-20 course examples (I'll code them)
3. Show me a screenshot of the Xello page
4. Just use the sample data for now and update later

Once I have the real data, I'll update `CourseSeeder.cs` with actual OHS courses!
