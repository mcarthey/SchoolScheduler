# ?? BOTH ISSUES - Real Fix This Time

## Issue 1: API Duplicate Error ? FIXED NOW

### The Real Problem
The previous fix handled duplicate courses, but NOT duplicate CSV records.
When we tried to process the CSV, we were iterating through records (which has duplicates).

### The Real Fix
Changed `LinkPrerequisites` to iterate through unique course codes instead of CSV records.

### What to Do
```powershell
# Stop API (Ctrl+C)
Remove-Item SchoolScheduler.Api\bin\Debug\net10.0\scheduler.db -Force -ErrorAction SilentlyContinue
dotnet run --project SchoolScheduler.Api
```

### Expected Output
```
? Added 260 courses to database
? Linked prerequisites for all courses
Now listening on: http://localhost:5031
```

---

## Issue 2: Angular Styling + Loading Spinner

### Problem 1: Buttons Not Styled
Angular's dev server cached the old CSS.

### Problem 2: Loading Spinner Stuck
Courses load but filtered list stays empty until you click a grade tab.

### The Fix

**Stop Angular** (Ctrl+C in scheduler-ui terminal)

Then run:
```powershell
cd scheduler-ui

# Clear ALL caches
Remove-Item -Recurse -Force .angular -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Restart
npm start
```

**Wait for "Compiled successfully"**

Then in browser:
1. Open http://localhost:4200
2. Press **Ctrl+Shift+F5** (hard refresh + clear cache)
3. Open DevTools (F12)
4. Go to Network tab
5. Check "Disable cache"
6. Refresh again (F5)

---

## Quick Test Checklist

### API (http://localhost:5031)
- [ ] Console shows "Linked prerequisites for all courses"
- [ ] No error about duplicate keys
- [ ] Swagger shows 260 courses

### Angular (http://localhost:4200)
After hard refresh:
- [ ] Action buttons have gradient colors
- [ ] Loading spinner disappears after ~1 second
- [ ] Courses appear immediately (no manual click)
- [ ] Browser console shows "Courses loaded: 260"

---

## Full Commands (Copy-Paste)

### Terminal 1: API
```powershell
# Stop current API (Ctrl+C)
Remove-Item SchoolScheduler.Api\bin\Debug\net10.0\scheduler.db -Force
dotnet run --project SchoolScheduler.Api
```

### Terminal 2: Angular
```powershell
# Stop current Angular (Ctrl+C)
cd scheduler-ui
Remove-Item -Recurse -Force .angular
Remove-Item -Recurse -Force node_modules/.cache
Remove-Item -Recurse -Force dist
npm start
```

### Browser
1. Open http://localhost:4200
2. Press **Ctrl+Shift+F5**
3. Open DevTools (F12) ? Network tab ? Check "Disable cache"
4. Refresh (F5)

---

## If Buttons STILL Not Styled

Check if the CSS is actually loading:

1. Open DevTools (F12)
2. Go to Elements tab
3. Find a button element
4. Look at Styles panel
5. Check if `.btn-primary` shows:
   ```css
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   ```

If NOT:
- Clear browser cache completely (Ctrl+Shift+Delete)
- Restart Angular dev server
- Try a different browser (incognito mode)

---

## Expected Visual Results

### Before (Current - Broken)
- ? Buttons: Plain gray/blue
- ? Loading: Spinner forever until click
- ? Console: "Courses loaded: 17"

### After (Expected - Fixed)
- ? Buttons: Gradient purple, green, orange, red
- ? Loading: Spinner shows briefly, then courses
- ? Console: "Courses loaded: 260"
- ? Console: "After grade filter: ~120"

---

**Do both fixes now:**
1. Restart API (Terminal 1)
2. Restart Angular with cache clear (Terminal 2)
3. Hard refresh browser (Ctrl+Shift+F5)
