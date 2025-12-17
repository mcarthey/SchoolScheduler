# ?? AUTO-SAVE SESSION FEATURE

## ? What Was Added

Your daughter's progress now **automatically saves** to her browser's local storage!

### Features
1. ? **Auto-Save** - Every time she adds/removes a course
2. ? **Auto-Restore** - Opens right where she left off
3. ? **Last Saved Indicator** - Shows "2 minutes ago" etc.
4. ? **Start Fresh Button** - Clear session and start over
5. ? **Persistent** - Survives browser refresh and computer restart

---

## How It Works

### First Visit
1. Opens app ? Empty state (0 / 24 credits)
2. Enters name "Sarah"
3. Selects courses ? **Auto-saved immediately**
4. Sees "?? Just now" at top

### Closing & Reopening
1. Closes browser (or even restarts computer)
2. Opens app again ? **Automatically restores**:
   - Her name
   - Selected courses for all 4 years
   - Current grade
   - Which sections are collapsed
3. Can continue right where she left off!

### Starting Fresh
1. Clicks "?? Start Fresh Session"
2. Confirms
3. Everything clears (but database saves remain)

---

## Two Types of Saves

### 1. Browser Session (Auto-Save) - NEW! ?
- **Where**: Browser localStorage
- **When**: Automatically on every change
- **Survives**: Browser refresh, computer restart
- **Lost**: If she clears browser cache
- **Use For**: Active planning session

### 2. Database Save (Manual)
- **Where**: SQLite database (scheduler.db file)
- **When**: Clicks "?? Save Plan to Database"
- **Survives**: Forever (until deleted)
- **Lost**: Never (unless database file deleted)
- **Use For**: Permanent backup

---

## UI Changes

### Actions Section (Top of Sidebar)
```
???????????????????????????????????????????
? ? Actions    ?? 2 minutes ago  [Collapse]?
???????????????????????????????????????????
? ?? Validate 4-Year Plan                 ?
? ?? Save Plan to Database                ?
? ??? Clear Freshman Year                  ?
? ?? Clear All Years                      ?
? ?? Start Fresh Session                  ? ? NEW!
???????????????????????????????????????????
```

### New Button: "Start Fresh Session"
- Gray button at bottom of actions
- Clears browser session (not database)
- Asks for confirmation first
- Perfect for trying different scenarios

### Last Saved Indicator
- Shows relative time: "Just now", "5 minutes ago", "Yesterday"
- Updates based on last auto-save
- Hidden if never saved

---

## What Gets Saved to Browser

```json
{
  "studentName": "Sarah Johnson",
  "currentGrade": 9,
  "schoolYear": "2025-2026",
  "currentYearIndex": 0,
  "yearPlans": [
    {
      "gradeLevel": 9,
      "gradeName": "Freshman",
      "selectedCourseIds": [5, 12, 23, 45, 67, 89],
      "totalCredits": 6
    },
    // ... other years
  ],
  "sectionsCollapsed": {
    "graduation": false,
    "selected": false,
    "validation": false
  },
  "lastSaved": "2024-12-17T01:30:45.123Z"
}
```

---

## Use Cases

### Scenario 1: Exploring Options
1. Sarah adds some courses
2. Validates ? sees conflicts
3. Closes browser for dinner
4. Reopens later ? **Everything restored!**
5. Tries different combination
6. When satisfied ? Clicks "Save Plan to Database"

### Scenario 2: Multiple Scenarios
1. Plans "Option A" (heavy AP load)
2. Clicks "Save Plan to Database"
3. Clicks "Start Fresh Session"
4. Plans "Option B" (balanced load)
5. Clicks "Save Plan to Database"
6. Now has 2 saved plans in database!

### Scenario 3: Computer Crash Recovery
1. Working on plan for 30 minutes
2. Computer crashes (uh oh!)
3. Restarts computer
4. Opens app ? **Last auto-save restored** (maybe lost 1-2 minutes max)

---

## Technical Details

### Storage Location
- **Browser**: `localStorage['ohs-course-planner-session']`
- **Database**: `scheduler.db` (API directory)

### Auto-Save Triggers
- Adding a course
- Removing a course
- Clearing a year
- Changing collapsed state

### Restore Process
1. App loads ? Checks localStorage
2. Finds saved session ? Waits for courses to load from API
3. Matches course IDs ? Restores selections
4. Updates UI ? Shows "Last saved: X ago"

### Data Privacy
- **LocalStorage**: Only on her browser/computer
- **Database**: Shared if others use same API
- **Never sent to cloud** (fully local)

---

## Files Changed

- ? `scheduler-ui/src/app/course-planner.component.ts`
  - Added `saveSessionToLocalStorage()`
  - Added `loadSessionFromLocalStorage()`
  - Added `restoreYearPlans()`
  - Added `clearSession()`
  - Added `getLastSavedTime()`
  - Auto-save triggers in `toggleCourse()` and `removeCourseFromYear()`

- ? `scheduler-ui/src/app/course-planner.component.html`
  - Added "Last Saved" indicator
  - Added "Start Fresh Session" button

- ? `scheduler-ui/src/app/course-planner.component.scss`
  - Added `.last-saved` styles
  - Added `.btn-secondary` styles

---

## Testing Steps

### 1. Test Auto-Save
1. Open http://localhost:4200
2. Add a course
3. Open browser DevTools (F12) ? Application tab ? Local Storage
4. Find key: `ohs-course-planner-session`
5. See JSON with your data!

### 2. Test Auto-Restore
1. Add some courses
2. Note "?? Just now" appears
3. **Close browser completely**
4. Reopen browser ? Go to http://localhost:4200
5. **Courses should be there!**

### 3. Test Start Fresh
1. With courses selected
2. Click "?? Start Fresh Session"
3. Confirm
4. Everything clears
5. "Last saved" disappears

### 4. Test Database Save
1. Add courses
2. Click "?? Save Plan to Database"
3. Click "Start Fresh Session" (clears browser)
4. Open Swagger: https://localhost:7217/api/plans
5. **Database save is still there!**

---

## Browser Console Messages

You'll see these in the console (F12):

```
Loading courses from API...
Courses loaded: 260 [...]
Session restored from localStorage Tue Dec 17 2024 01:30:45
Session auto-saved to localStorage
```

---

## Clearing Data

### Clear Browser Session Only
- Click "?? Start Fresh Session"
- OR: DevTools ? Application ? Local Storage ? Delete key

### Clear Database Saves
- Delete `scheduler.db` file
- OR: Use API DELETE endpoints in Swagger

### Clear Everything
```powershell
# Browser session
# (Use "Start Fresh Session" button)

# Database
Remove-Item SchoolScheduler.Api\scheduler.db
```

---

## Benefits

### For Students
- ? Never lose progress
- ? Can explore different scenarios
- ? No "save" button to remember
- ? Works offline (after initial load)

### For Parents
- ? Can review anytime (browser history)
- ? Database backup for permanent saves
- ? Easy to export/share (database file)

---

## Limitations

### Browser-Specific
- Different browsers = different sessions
- Incognito mode = lost on close
- Clearing browser cache = lost

### Solution
Use "?? Save Plan to Database" for permanent backup!

---

## Future Enhancements (Optional)

Would you like me to add:

1. **"Load Saved Plan" Button**
   - Dropdown of database saves
   - Click to restore any previous plan
   - Compare multiple scenarios

2. **Export/Import**
   - Export plan to JSON file
   - Share with counselor/parent
   - Import someone else's plan

3. **Multiple Sessions**
   - "Option A", "Option B", "Option C"
   - Switch between them
   - Compare side-by-side

---

## Updated Commit Message

```
feat: add auto-save session with localStorage + SQLite persistence

NEW FEATURES:
- Auto-save to browser localStorage on every course change
- Auto-restore session on page reload
- "Last Saved" indicator shows relative time
- "Start Fresh Session" button to clear and restart
- Dual persistence: browser (temp) + database (permanent)

IMPROVEMENTS:
- Switched to SQLite for persistent database storage
- Moved action buttons out of collapsible section
- Added "Collapse All" button for quick UI cleanup
- Session survives browser refresh and computer restart

TECHNICAL:
- localStorage session management in course-planner component
- SQLite database replaces in-memory store
- Auto-save triggers on course add/remove
- Smart restore waits for courses to load from API

BENEFITS:
- Students never lose progress
- Can explore multiple scenarios safely
- Database saves for permanent backup
- Works offline after initial load

FILES CHANGED:
- scheduler-ui/src/app/course-planner.component.ts - Session management
- scheduler-ui/src/app/course-planner.component.html - UI updates
- scheduler-ui/src/app/course-planner.component.scss - Styling
- SchoolScheduler.Api/Program.cs - SQLite configuration
- SchoolScheduler.Api/SchoolScheduler.Api.csproj - SQLite package

See SQLITE_UI_IMPROVEMENTS.md and SESSION_AUTOSAVE.md for details
```

---

**Restart Angular to see the auto-save feature!** ??

```powershell
cd scheduler-ui
npm start
```

Try adding a course, closing the browser, and reopening - your progress will be there! ???
