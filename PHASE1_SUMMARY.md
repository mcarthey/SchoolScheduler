# OHS Course Planning Assistant - Phase 1

## What We Built

A **Course Selection Planner** to help OHS students choose courses WITHOUT needing to know specific period assignments or times.

---

## New Features

### 1. **Course Catalog** (`Course.cs`)
Replaces the time-based scheduling with actual course information:
- ? Course name, code, department
- ? Duration (Full Year, Semester 1/2, Quarter 1-4)
- ? Block type (Block 85min or Skinny 40min)
- ? Credits earned
- ? Grade level eligibility
- ? Prerequisites
- ? AP/Honors designation
- ? Workload estimate (1-5)
- ? Periods required (1 or 2 for double-block sciences)

### 2. **Student Plan** (`StudentPlan.cs`)
Students can create and save course selection plans:
- Student name and grade level
- School year
- Selected courses
- Notes/comments

### 3. **Smart Validation** (`PlanValidator.cs`)
Automatically checks for problems:

**Errors (Must Fix):**
- ? Too many periods (> 8 available slots)
- ? Course not available for grade level
- ? Missing required credits for graduation (seniors)

**Warnings (Should Review):**
- ?? Missing prerequisites
- ?? Department conflicts (multiple courses in same semester)
- ?? Heavy workload (>4 AP/Honors courses)
- ?? Not enough courses for typical schedule
- ?? Graduation progress tracking

### 4. **Statistics Dashboard**
Shows helpful metrics:
- Total courses and credits
- Credits by department (English, Math, Science, etc.)
- Number of AP/Honors courses
- Estimated homework hours per week
- Total periods used (out of 8 available)

---

## Sample Data

Included sample OHS courses:
- **English**: English 9/10, AP English Language
- **Math**: Algebra 1, Geometry, AP Calculus
- **Science**: Biology, Chemistry, AP Biology (double-block)
- **Social Studies**: World History, US History, AP US History
- **Electives**: Spanish 1/2, Art, PE, Health

---

## How Students Will Use This

1. **Select Courses**: Browse catalog, add desired courses to plan
2. **See Validation**: Get instant feedback on problems
3. **Check Progress**: See if they're on track for graduation
4. **Balance Workload**: See estimated homework hours
5. **Save Plans**: Compare multiple "what-if" scenarios

---

## What's NOT Included (By Design)

- ? Specific period assignments (A, B, C, D blocks)
- ? Exact times (7:20 AM, etc.)
- ? Days of week (Mon/Wed/Fri)
- ? Teacher assignments

**Why?** Students don't know this info when selecting courses! The school assigns periods later.

---

## Next Steps

### Phase 1 (This Week):
1. ? Create data models
2. ? Build validation logic
3. ? Add API endpoints
4. ? Build simple UI to test

### Phase 2 (Next Week):
1. Import real OHS course data from Xello
2. Add 4-year planning view
3. Add prerequisite chains (show course sequences)
4. Add course comparison (vs. other students)

### Phase 3 (Later):
1. Export to PDF for registration
2. Share plans with counselors
3. Mobile-friendly responsive design

---

## Technical Details

**Backend (.NET 10):**
- New entities: `Course`, `StudentPlan`
- New validation: `PlanValidator`, `PlanValidationResult`
- Sample data: `CourseSeeder`
- Database: EF Core with in-memory DB

**Still Compatible With:**
- Existing `ClassModel` (kept for backward compatibility)
- Existing API endpoints

---

## How to Test

1. **Seed database** with sample courses
2. **Create a student plan** with 6-8 courses
3. **Validate** to see errors/warnings
4. **View statistics** to check progress

---

## Real-World Benefits

**For Students:**
- ? Catch problems BEFORE registration closes
- ? Understand graduation requirements
- ? Balance workload (don't overload on APs)
- ? Plan course sequences (prerequisites)
- ? Save time (no more paper lists!)

**For Parents:**
- ? See what courses child is taking
- ? Understand credit requirements
- ? Plan for college applications

**For Counselors:**
- ? Students arrive prepared to registration meetings
- ? Fewer schedule change requests
- ? Better course load distribution

---

## Questions for Your Daughter

1. **Course Data**: Can you export the Xello course guide as CSV or Excel?
2. **Graduation Requirements**: Are the credit requirements I listed correct? (4 English, 3 Math, etc.)
3. **Useful Features**: What would help MOST right now?
   - See all courses in one place?
   - Check if you can take a course (grade level, prerequisites)?
   - Plan all 4 years at once?
   - Compare plans with friends?

---

**Built with ?? to solve a real problem for real students!**
