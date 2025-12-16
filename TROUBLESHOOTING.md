# Troubleshooting: Empty Dropdown & No Courses

## What to Check

### 1. Is the API Running?
Open a new browser tab and go to:
```
https://localhost:7217/api/courses
```

**Expected Result:** JSON array of 17 courses

**If you see an error:**
- Make sure you started the API (press F5 on SchoolScheduler.Api project)
- Check the API is running in the terminal/output window

---

### 2. Check Browser Console
1. Open the Angular app: http://localhost:4200
2. Press **F12** to open Developer Tools
3. Click on **Console** tab
4. Look for these messages:
   - "Loading courses from API..."
   - "Courses loaded: 17 [...]"
   - "Departments: ['All', 'English', 'Math', ...]"

**If you see CORS error:**
```
Access to XMLHttpRequest at 'https://localhost:7217/api/courses' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

**Fix:** The API should already have CORS configured, but if not:
- Restart the API
- Make sure `app.UseCors("AllowAngular")` is in Program.cs

**If you see "Error loading courses":**
- Check the API is running
- Check the network tab in DevTools for the exact error

---

### 3. Check Network Tab
1. In DevTools, click **Network** tab
2. Refresh the page
3. Look for a request to `https://localhost:7217/api/courses`
4. Click on it to see:
   - **Status Code**: Should be 200
   - **Response**: Should show JSON with courses

**If Status Code is 0 or failed:**
- API is not running or wrong URL

**If Status Code is 500:**
- API error - check the API console for error messages

---

### 4. Quick Fix Commands

**Restart Everything:**
```bash
# Stop all running processes (Ctrl+C in terminals)

# Terminal 1: Start API
cd SchoolScheduler.Api
dotnet run

# Terminal 2: Start Angular
cd scheduler-ui
npm start
```

**Test API Directly:**
```bash
# Should return JSON with courses
curl https://localhost:7217/api/courses

# Or use PowerShell
Invoke-WebRequest -Uri "https://localhost:7217/api/courses" -SkipCertificateCheck
```

---

### 5. Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| API not running | Network error in console | Start API with `dotnet run` |
| Wrong API URL | 404 Not Found | Check `environment.ts` has correct URL |
| CORS not configured | CORS policy error | Verify `AllowAngular` policy in Program.cs |
| Database not seeded | Empty array `[]` returned | Delete database and restart API |
| HTTPS certificate | SSL/TLS error | Accept certificate warning in browser |

---

### 6. Debug Steps

**Step 1: Test API works**
```bash
# In browser, go to:
https://localhost:7217/swagger

# Try the GET /api/courses endpoint
# Should show 17 courses
```

**Step 2: Check Angular environment**
```typescript
// scheduler-ui/src/app/environment.ts should have:
export const environment = {
  apiUrl: 'https://localhost:7217'
};
```

**Step 3: Check console logs**
- Open http://localhost:4200
- Open F12 console
- Should see course data logged

---

### 7. If Still Not Working

**Try this manual test:**

1. Open browser console on http://localhost:4200
2. Paste this code:
```javascript
fetch('https://localhost:7217/api/courses')
  .then(r => r.json())
  .then(data => console.log('Courses:', data))
  .catch(err => console.error('Error:', err));
```

3. Check the result:
   - **Success:** You'll see the courses array
   - **Error:** You'll see what's wrong (CORS, network, etc.)

---

### 8. Expected Data Structure

When working correctly, the API should return:
```json
[
  {
    "id": 1,
    "name": "English 9",
    "courseCode": "ENG9",
    "department": "English",
    "duration": "Full Year",
    "blockType": "Block",
    "credits": 1.0,
    "gradeLevels": [9],
    "prerequisiteIds": [],
    "isAdvanced": false,
    "description": "...",
    "periodsRequired": 1,
    "workloadLevel": 3
  },
  // ... 16 more courses
]
```

---

## Quick Diagnostic

Run this in PowerShell:
```powershell
# Check if API is running
Test-NetConnection -ComputerName localhost -Port 7217

# Try to fetch courses (requires curl)
curl https://localhost:7217/api/courses -k

# Check if Angular dev server is running
Test-NetConnection -ComputerName localhost -Port 4200
```

---

**After following these steps, share what you see in the console and I can help fix it!**
