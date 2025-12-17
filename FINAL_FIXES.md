# ?? FINAL FIXES - Action Buttons + Loading Spinner

## Issues to Fix

1. **Action buttons still plain** - Angular cache needs clearing
2. **Loading spinner stuck** - filteredCourses not populating on initial load

---

## Fix 1: Clear Angular Cache + Rebuild

### Step 1: Stop Angular (Ctrl+C in terminal)

### Step 2: Clear Cache
```powershell
cd scheduler-ui
Remove-Item -Recurse -Force .angular
```

### Step 3: Rebuild from Scratch
```powershell
npm run build
```

### Step 4: Restart Dev Server
```powershell
npm start
```

### Step 5: Hard Refresh Browser
- Press **Ctrl+Shift+R** (Windows)
- OR **Cmd+Shift+R** (Mac)
- This forces browser to reload CSS

---

## Fix 2: Loading Spinner Debug

Added debug logging to `applyFilters()` to trace why courses aren't showing.

**Check browser console** (F12) after Angular restarts:
- Should see: "Courses loaded: 260 [...]"
- Should see: "Applying filters - courses: 260 grade: 9"
- Should see: "After grade filter: X"
- Should see: "Filtered courses set: X"

If you see 0 for "After grade filter", it means the grade level filter is too restrictive.

---

## Expected Result After Fix

### Action Buttons (Left Sidebar)
```
? Validate 4-Year Plan   [Purple gradient]
? Save Plan              [Green gradient]
? Clear Freshman Year    [Orange gradient]
? Clear All Years        [Red gradient]
```

### Course Loading
```
1. Page loads ? Spinner shows
2. API responds ? Courses load (260)
3. Filters apply ? Courses appear immediately
4. NO manual click needed!
```

---

## Quick Test Steps

### 1. Restart Angular
```powershell
cd scheduler-ui
Remove-Item -Recurse -Force .angular
npm start
```

### 2. Open Browser
http://localhost:4200

### 3. Check Console (F12)
Look for:
```
Loading courses from API...
Courses loaded: 260 [...]
Departments: (17) ['All', 'Agriscience', 'Aviation', ...]
Applying filters - courses: 260 grade: 9
After grade filter: 120  # or similar number
Filtered courses set: 120
```

### 4. Verify UI
- ? Spinner disappears
- ? Courses visible immediately
- ? Action buttons have gradients
- ? Department dropdown has 16 options

---

## If Buttons Still Plain

### Option A: Check SCSS is loaded
```powershell
# Verify file exists
Test-Path scheduler-ui/src/app/course-planner.component.scss
```

### Option B: Force rebuild
```powershell
cd scheduler-ui
Remove-Item -Recurse -Force node_modules/.cache
Remove-Item -Recurse -Force .angular
npm install
npm start
```

### Option C: Check browser DevTools
1. Press F12
2. Go to "Elements" tab
3. Inspect a button
4. Check if `.btn-primary` has `background: linear-gradient(...)`
5. If not, hard refresh (Ctrl+Shift+R)

---

## If Courses Still Don't Load

### Check API Response
1. Open: https://localhost:7217/api/courses
2. Should return JSON with 260 courses
3. Each course should have `gradeLevels` array

### Check Console Errors
```javascript
// Browser console should NOT show:
? Error loading courses
? CORS error
? Failed to fetch

// Should show:
? Loading courses from API...
? Courses loaded: 260
? Departments: (17) ['All', ...]
```

### Check Grade Level Filter
If console shows "After grade filter: 0", it means no courses match grade 9.

**Fix**: Check CSV - do courses have grade levels?
```powershell
Get-Content ohs-courses.csv | Select-String "9,10,11,12" | Select -First 5
```

---

## Complete Reset (Nuclear Option)

If nothing works:

```powershell
# 1. Stop everything
# Press Ctrl+C in API and Angular terminals

# 2. Delete everything
Remove-Item -Recurse -Force scheduler-ui/.angular
Remove-Item -Recurse -Force scheduler-ui/node_modules/.cache
Remove-Item SchoolScheduler.Api/bin/Debug/net10.0/scheduler.db* -Force

# 3. Rebuild backend
dotnet clean
dotnet build

# 4. Rebuild frontend
cd scheduler-ui
npm install
npm run build

# 5. Restart both
# Terminal 1:
dotnet run --project SchoolScheduler.Api

# Terminal 2:
cd scheduler-ui
npm start

# 6. Hard refresh browser
# Ctrl+Shift+R
```

---

## Success Checklist

After Angular restarts:

- [ ] Open http://localhost:4200
- [ ] Spinner shows briefly
- [ ] Courses load immediately (no click needed)
- [ ] Action buttons have colorful gradients
- [ ] Department dropdown has 16 options
- [ ] Freshman year shows ~120 courses
- [ ] Browser console shows debug logs

---

**Try this now:**

```powershell
cd scheduler-ui
Remove-Item -Recurse -Force .angular
npm start
```

Then open browser and press **Ctrl+Shift+R**!
