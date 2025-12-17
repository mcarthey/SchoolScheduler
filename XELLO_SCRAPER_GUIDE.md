# ?? Using the Xello Scraper - Quick Guide

## ? Fixed Issues

### 1. Scraper Now Works with Xello's HTML
- ? Updated selectors to match Xello's actual structure (`.courses__course`)
- ? Extracts department from discipline headers
- ? Handles nested course lists correctly
- ? Parses course codes from titles (e.g., "Aviation - 70279S")
- ? Detects "Skinny" vs "Block" from course name
- ? Extracts prerequisites from button links
- ? Determines semester from course notes

### 2. Visual Studio Integration
- ? Added as project to solution
- ? Can run from Visual Studio UI
- ? Output appears in Output window
- ? npm install runs automatically on build

---

## ?? How to Use (Visual Studio)

### Option A: Run from Solution Explorer
1. **Right-click** `XelloScraper` project
2. **Debug ? Start Without Debugging** (Ctrl+F5)
3. Browser opens ? **Log in to Xello**
4. Navigate to: https://educator.xello.world/course-guide/d15fff78-6def-4cc6-8ffc-ce1cd06fb4f7
5. **Press ENTER** in Output window
6. Scraper extracts courses
7. Find `ohs-courses.csv` in solution root

### Option B: Run from Terminal
1. **View ? Terminal** (Ctrl+`)
2. `cd xello-scraper`
3. `npm run scrape`
4. Follow prompts

---

## ?? What Gets Extracted

From the HTML you shared, the scraper now correctly extracts:

| Field | Example | Source |
|-------|---------|--------|
| Course Code | "05273" | From title "...SAE Development - 05273" |
| Course Name | "Agribusiness, Economics, Marketing and SAE Development" | Title without code |
| Department | "Agriscience" | Discipline header |
| Credits | "0.5" | `.courses__course-credit` |
| Grade Levels | "11,12" | `.courses__course-grade` |
| Block Type | "Skinny" or "Block" | From "(Skinny)" in title |
| Duration | "Full Year", "Semester 1", "Semester 2" | From course notes |
| Prerequisites | "05031S,05121S,..." | From prerequisite buttons |
| Description | Full course description | `.courses__course-description p` |

---

## ?? Test with Your Data

The scraper is now configured for these selectors based on your HTML:

```javascript
// Disciplines (departments)
'.disciplines-and-courses__discipline'
  ? '.disciplines-and-courses__discipline-name'  // "Agriscience", "Aviation", etc.

// Courses within each discipline
'.courses__course'
  ? '.courses__course-title'        // "Aviation Exploration (Skinny) - 70279S"
  ? '.courses__course-credit'       // "0.5"
  ? '.courses__course-grade'        // "9, 10, 11, 12"
  ? '.courses__course-description'  // Full description
  ? '.courses__details-subsection'  // Prerequisites and notes
```

---

## ?? Expected Output

After running, you should see:

```
?? Starting Xello Course Scraper...

?? Navigating to Xello...

??  PLEASE LOG IN TO XELLO MANUALLY
    Once logged in and you see the course list, press ENTER here...

[You press ENTER]

?? Starting course scrape...

? Course list loaded!

? Found 150+ courses!

?? Saved 150+ courses to ../ohs-courses.csv

?? Sample courses:
   - Agribusiness, Economics, Marketing and SAE Development (05273) - Agriscience - 0.5 cr
   - Aviation Exploration (70279S) - Aviation - 1 cr
   - Drones in Aviation (70277) - Aviation - 1 cr
   - Flight and Aircraft Systems (70278S) - Aviation - 1 cr
   ...

?? Done! Closing browser...
```

---

## ?? If It Still Doesn't Work

1. **Check the screenshot**: `xello-error.png` (auto-created on error)
2. **Check the HTML dump**: `xello-page.html` (auto-created if no courses found)
3. **Share the error message** from Output window
4. **Try these debug steps**:

```bash
# Open xello-page.html in browser
# Look for elements with these classes:
# - .courses__course
# - .courses__course-title
# - .disciplines-and-courses__discipline
```

---

## ?? Success? What's Next

Once you have `ohs-courses.csv`:

1. **Review the data**: Open in Excel/Notepad
2. **Check for issues**: Missing departments, wrong credits, etc.
3. **Import to database**: Use the CSV import feature (coming next!)
4. **Test in UI**: Courses should appear in the planner

---

## ?? Pro Tips

- **Multiple Runs**: Delete old `ohs-courses.csv` before re-running
- **Partial Scrape**: If scraper fails mid-way, it still saves what it found
- **Department Mapping**: Scraper uses Xello's discipline names directly
- **Credit Parsing**: Handles "0.5", "1", "1.0" formats
- **Grade Levels**: Removes spaces ("9, 10, 11" ? "9,10,11")

---

**Ready to scrape? Try it now!** ??

1. Press **Ctrl+F5** on XelloScraper project
2. Log in when browser opens
3. Press **ENTER** in Output window
4. Get all OHS courses in CSV format!
