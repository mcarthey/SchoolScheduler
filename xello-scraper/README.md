# Xello Course Scraper

Automated tool to extract OHS course data from Xello and convert it to CSV format for import.

## Running from Visual Studio

### First Time Setup
1. **Right-click** on `XelloScraper` project in Solution Explorer
2. Select **"Open in Terminal"**
3. Run: `npm install`

### Running the Scraper
1. **Right-click** on `XelloScraper` project
2. Select **"Debug" ? "Start New Instance"**  
   OR press **Ctrl+F5** with XelloScraper selected

3. **Browser opens** ? Log in to Xello manually
4. **Navigate** to the course guide (if not there already)
5. **Press ENTER** in the Visual Studio Output window
6. **Scraper runs** and creates `ohs-courses.csv`

### Viewing Output
- Check the **Output** window in Visual Studio
- Look for `ohs-courses.csv` in the solution root folder

---

## Quick Start (Command Line)

### Option 1: Automatic Scraping (Recommended)

```bash
# 1. Navigate to scraper folder
cd xello-scraper

# 2. Install dependencies
npm install

# 3. Run scraper
npm run scrape

# 4. Follow prompts:
#    - Browser will open to Xello login page
#    - Log in manually
#    - Navigate to course guide
#    - Press ENTER in terminal
#    - Script will scrape all courses
#    - CSV file created: ohs-courses.csv
```

### Option 2: Third-Party API Services

If Xello scraping doesn't work, try these services:

1. **ScrapingBee** (https://www.scrapingbee.com)
   - Free tier: 1,000 requests/month
   - Handles JavaScript rendering
   - No coding required

2. **Apify** (https://apify.com)
   - Free tier: $5 credit/month
   - Pre-built Xello scraper (if available)
   - More powerful for complex sites

3. **Bright Data** (https://brightdata.com)
   - Enterprise-grade
   - Handles login flows
   - Expensive but reliable

### Option 3: Chrome Extension Method

1. **Install Chrome Extension**: "Table Capture" or "Web Scraper"
2. Navigate to Xello course guide
3. Use extension to extract table data
4. Export as CSV
5. Format to match our template

---

## How the Scraper Works

1. **Opens Browser**: Launches Chrome in visible mode
2. **Manual Login**: You log in to Xello (required for security)
3. **Waits for Signal**: Press Enter when ready
4. **Scrapes Courses**: Extracts all course data from the page
5. **Processes Data**: Cleans and formats the data
6. **Exports CSV**: Creates `ohs-courses.csv` ready for import

---

## Troubleshooting

### "No courses found"

**Problem**: Selectors don't match Xello's HTML structure

**Fix**:
1. Check `xello-page.html` (auto-saved)
2. Inspect Xello page with DevTools (F12)
3. Update selectors in `scrape-xello.js`:
   ```javascript
   // Line ~50 - Adjust these selectors:
   const courseCards = document.querySelectorAll('.your-actual-selector');
   ```

### "Login fails" or "Page doesn't load"

**Fix**:
1. Check your Xello credentials
2. Ensure you have access to the course guide
3. Try navigating manually after login

### "CSV format is wrong"

**Fix**:
1. Open `ohs-courses.csv`
2. Manually adjust any incorrect fields
3. Re-run import

---

## Advanced: Customizing Selectors

If Xello's HTML structure is different, update these lines in `scrape-xello.js`:

```javascript
// Around line 55-65, adjust selectors to match Xello's actual HTML:
const course = {
  courseCode: card.querySelector('.actual-code-class')?.textContent?.trim() || '',
  courseName: card.querySelector('.actual-name-class')?.textContent?.trim() || '',
  // ... etc
};
```

**How to find selectors:**
1. Open Xello in Chrome
2. Press F12 (DevTools)
3. Click selector tool (top-left arrow)
4. Click on a course element
5. Note the class names in the Elements tab
6. Update the script

---

## CSV Output Format

The scraper creates a CSV file with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| CourseCode | School course code | "ENG0900" |
| CourseName | Full course name | "English 9" |
| Department | Subject area | "English" |
| Duration | Course length | "Full Year" |
| BlockType | Class period type | "Block" or "Skinny" |
| Credits | Credits earned | "1.0" |
| GradeLevels | Eligible grades | "9,10" |
| Prerequisites | Required courses | "ENG0800" |
| IsAdvanced | AP/Honors flag | "true" or "false" |
| Description | Course description | "Study of..." |
| PeriodsRequired | Periods per day | "1" or "2" |
| WorkloadLevel | Difficulty 1-5 | "3" |

---

## After Scraping

Once you have `ohs-courses.csv`:

1. **Review the file**: Check for accuracy
2. **Import to app**: Use the CSV import feature (coming next)
3. **Test courses**: Verify they show up in the planner

---

## Alternative: Manual Export from Xello

If automated scraping doesn't work:

1. Log in to Xello
2. Navigate to Course Guide
3. Select all courses (Ctrl+A)
4. Copy (Ctrl+C)
5. Paste into Excel/Google Sheets
6. Format to match CSV template
7. Export as `ohs-courses.csv`

---

## Security Note

?? **Never commit your Xello credentials to Git!**

The scraper doesn't store credentials - you log in manually each time.

---

## Need Help?

If the scraper isn't working:

1. Run it and share the output/errors
2. Send the `xello-error.png` screenshot
3. Send first few lines of `xello-page.html`
4. I'll adjust the selectors for you

---

**Ready to scrape? Run `npm run scrape` and let's get that course data!** ??
