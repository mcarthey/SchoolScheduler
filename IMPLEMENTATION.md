# Calendar Implementation - Installation & Setup

## Summary of Changes

This document outlines all changes made to transform the SchoolScheduler UI from a basic form + list into a calendar-first scheduling interface.

## New Dependencies

Install these by running from `scheduler-ui/`:

```bash
npm install @fullcalendar/angular@^7.1.0 @fullcalendar/core@^7.1.0 @fullcalendar/timegrid@^7.1.0 @fullcalendar/daygrid@^7.1.0 @fullcalendar/interaction@^7.1.0
```

These are already listed in `package.json` - just run `npm install` at the top level.

## Files Modified

### 1. **[README.md](../README.md)** — Repository Documentation
- **Changed**: Removed merge conflict markers
- **Why**: Clean onboarding for new developers; added UI architecture section and known limitations

### 2. **[scheduler-ui/src/app/app.ts](scheduler-ui/src/app/app.ts)** — Root Component
- **Changed**: Replaced form-based UI with CalendarComponent
- **Why**: Calendar becomes the primary scheduling interface
- **New behavior**: App now provides HttpClientModule and renders the calendar view

### 3. **[scheduler-ui/src/app/app.html](scheduler-ui/src/app/app.html)** — Root Template
- **Changed**: Replaced old form HTML with a comment (now handled by CalendarComponent)
- **Why**: UI logic moved to dedicated calendar component

### 4. **[scheduler-ui/src/app/class.service.ts](scheduler-ui/src/app/class.service.ts)** — Class HTTP Service
- **Changed**: 
  - Extended `ClassModel` interface with UI-only fields: `daysOfWeek`, `startTime`, `endTime`
  - Added `updateClass()` method (TODO: full PATCH/PUT support)
  - Added `serializeForBackend()` to strip UI fields before sending to API
- **Why**: 
  - UI needs meeting day/time info for calendar rendering (not currently in backend model)
  - Allows drag-to-reschedule without breaking backend contract
  - Clear separation between UI-local state and persisted API state

### 5. **[scheduler-ui/src/app/calendar.component.ts](scheduler-ui/src/app/calendar.component.ts)** — Main Calendar View (NEW)
- **Purpose**: Week/Day view calendar powered by FullCalendar
- **Features**:
  - Loads classes from API and enriches them with default scheduling (Mon/Wed, 9 AM, 60 min duration)
  - Converts ClassModel array to FullCalendar event format
  - Renders conflicts visually (red borders/background)
  - Supports drag-and-drop to reschedule (calls API to persist)
  - Modal for adding/editing classes with live preview
  - View switcher (Week, Day, Explore Schedules)

### 6. **[scheduler-ui/src/app/calendar.component.html](scheduler-ui/src/app/calendar.component.html)** — Calendar Template (NEW)
- **Purpose**: Layout for calendar view, conflict warnings, and modal
- **Key sections**:
  - View control buttons
  - Conflict warning panel (if any)
  - FullCalendar component
  - Schedule Explorer view
  - Edit Class Modal overlay

### 7. **[scheduler-ui/src/app/calendar.component.scss](scheduler-ui/src/app/calendar.component.scss)** — Calendar Styles (NEW)
- **Purpose**: Responsive layout, modal styling, FullCalendar theming

### 8. **[scheduler-ui/src/app/edit-class-modal.component.ts](scheduler-ui/src/app/edit-class-modal.component.ts)** — Edit Form Modal (NEW)
- **Purpose**: Create/edit classes with validation and live preview
- **Features**:
  - Form for all class fields + meeting day/time selectors
  - Day of week picker (clickable buttons for Sun-Sat)
  - Comprehensive validation with error messages
  - API calls to save new or update existing classes
  - Emits events to parent calendar component on save/close

### 9. **[scheduler-ui/src/app/edit-class-modal.component.html](scheduler-ui/src/app/edit-class-modal.component.html)** — Edit Modal Template (NEW)
- **Purpose**: Form layout with day selector, time inputs, and validation feedback

### 10. **[scheduler-ui/src/app/edit-class-modal.component.scss](scheduler-ui/src/app/edit-class-modal.component.scss)** — Edit Modal Styles (NEW)
- **Purpose**: Modal form styling, day button styles, error feedback

### 11. **[scheduler-ui/src/app/conflict-detector.service.ts](scheduler-ui/src/app/conflict-detector.service.ts)** — Conflict Detection (NEW)
- **Purpose**: Detects overlapping class time blocks
- **Algorithm**:
  - Two classes conflict if they share a meeting day (daysOfWeek) AND their time windows overlap
  - Returns list of `ClassConflict` objects with descriptive reason strings
  - Used by calendar to color-code conflicting classes and populate warning panel

### 12. **[scheduler-ui/src/app/schedule-explorer.component.ts](scheduler-ui/src/app/schedule-explorer.component.ts)** — Schedule Options UI (NEW)
- **Purpose**: Browse multiple candidate schedules (currently stubbed)
- **Features**:
  - Displays 4 schedule options: Current, Best, Alternative, Close But Conflicts
  - Each option shows class list, conflict summary, and quality score
  - Stubbed data generation for POC (placeholder for future backend solver integration)
  - Shows which schedule is selected
  - Helper methods for day name formatting and priority color coding

### 13. **[scheduler-ui/src/app/schedule-explorer.component.html](scheduler-ui/src/app/schedule-explorer.component.html)** — Explorer Template (NEW)
- **Purpose**: Schedule comparison cards and detailed view
- **Sections**:
  - Card grid for browsing options
  - Selected schedule details with class table and conflicts

### 14. **[scheduler-ui/src/app/schedule-explorer.component.scss](scheduler-ui/src/app/schedule-explorer.component.scss)** — Explorer Styles (NEW)
- **Purpose**: Card layout, data table styling, conflict/success indicators

### 15. **[scheduler-ui/src/styles.scss](scheduler-ui/src/styles.scss)** — Global Styles
- **Changed**: Added global reset, font settings, scrollbar styling
- **Why**: Consistent visual baseline across all components

### 16. **[scheduler-ui/package.json](scheduler-ui/package.json)** — Dependencies
- **Changed**: Added FullCalendar packages to dependencies
- **Packages**:
  - `@fullcalendar/angular` — Angular wrapper
  - `@fullcalendar/core` — Core library
  - `@fullcalendar/timegrid` — Time grid view (Week/Day)
  - `@fullcalendar/daygrid` — Day grid view (Month)
  - `@fullcalendar/interaction` — Drag-drop and click interactions

## Installation & Startup

### Backend
```bash
dotnet run --project SchoolScheduler.Api --launch-profile https
```
- Runs on `https://localhost:7217` with in-memory database
- Swagger at `https://localhost:7217/swagger`

### Frontend
```bash
cd scheduler-ui
npm install  # Installs new FullCalendar dependencies
npm run start
```
- Runs on `http://localhost:4200`
- Calendar view loads immediately with Week view as default

## Key Implementation Details

### 1. UI-Only Fields Strategy
**Problem**: Backend ClassModel lacks meeting day/time fields. Calendar needs this info to render.

**Solution**: 
- `ClassModel` interface in `class.service.ts` extends backend model with:
  - `daysOfWeek?: number[]` — Days 0-6 where class meets
  - `startTime?: string` — HH:mm format
  - `endTime?: string` — HH:mm format
- These fields are **not persisted** to the API (stripped by `serializeForBackend()`)
- Defaults assigned on load: `[Monday, Wednesday]`, `09:00-10:00`
- When backend evolves to support recurrence, these will be sent to API

**Future Backend Work**:
```csharp
// Add to ClassModel
public int[] DaysOfWeek { get; set; } // 0-6: Sun-Sat
public TimeSpan StartTime { get; set; }
public TimeSpan EndTime { get; set; }
// Update endpoint validators and serialization
```

### 2. Conflict Detection
- **Service**: `ConflictDetectorService`
- **Algorithm**: Two classes conflict if:
  1. They share at least one meeting day (intersection of `daysOfWeek`)
  2. Their time windows overlap (time1.start < time2.end AND time2.start < time1.end)
- **UI Integration**: Calendar colors conflicting classes red; displays warning panel with detailed reasons

### 3. Drag & Drop
- **Technology**: FullCalendar's built-in event drag-drop (powered by interact.js)
- **Behavior**: User drags a class block to a different day → new day is captured → API call updates the class
- **Limitation**: Currently only updates the day; time unchanged (can be enhanced)
- **Error Handling**: If API fails, UI reloads from server to revert changes

### 4. Schedule Explorer (Stubbed)
- **UI Framework**: Card-based interface showing 4 schedule options
- **Current Behavior**: Generates fake "alternative" schedules by shuffling meeting days
- **Score Calculation**: Simulated (90%+ excellent, 75-89% good, <75% fair)
- **Future Integration**: Replace stub with call to backend optimization service

### 5. Edit Modal
- **Validation**: Client-side checks for required fields, date logic, priority range
- **Live Preview**: While editing, form updates calendar ghost event (TODO: visual ghost)
- **Save Flow**: Validates → serializes (strips UI fields) → calls API → emits saved event to calendar

## Testing the Implementation

### 1. Load and view seeded class
```bash
curl -k https://localhost:7217/classes
```
Expected: Returns `[{ id: 1, name: "English 10", ... }]`

### 2. Add a class via UI
- Click "+ Add Class" button
- Fill form (Name, Date range, Term, Duration, Days, Time, Priority)
- Click "Add Class"
- Expected: Class appears on calendar immediately; visible on next page refresh

### 3. Drag a class to a different day
- Click and hold on a class block on calendar
- Drag to a different day column
- Expected: Class moves; API is called; warning shows if new day creates conflict

### 4. View conflicts
- Add two classes that meet on the same day and overlap in time
- Expected: Both classes show red borders; warning panel appears with conflict description

### 5. Explore schedules (POC)
- Click "🔍 Explore Schedules" tab
- Expected: See 4 schedule card options; click to select and view details

## Known Limitations & TODOs

### Backend
1. **No PUT/PATCH endpoint**: Currently using POST for update (should be `/classes/{id}`)
2. **No recurrence support**: Meeting day/time stored locally only
3. **No schedule solver**: Optimization/generation is stubbed in UI

### Frontend
1. **No ghost event**: Dragging shows no preview during drag
2. **No undo/draft workflow**: Changes persisted immediately
3. **No time zone handling**: Assumes single time zone
4. **Browser support**: Tested on Chrome; Firefox/Safari pending

### Upcoming Enhancements (Priority Order)
1. Add `daysOfWeek`, `startTime`, `endTime` to backend ClassModel
2. Implement proper PATCH `/classes/{id}` endpoint
3. Build schedule solver algorithm (constraint satisfaction or ML-based)
4. Add visual drag preview (ghost event)
5. Add recurring class support (weekly patterns)
6. Add undo/draft workflow
7. Timezone support

## File Structure Summary

```
scheduler-ui/
├── src/
│   ├── app/
│   │   ├── app.ts                          [MODIFIED] Root component
│   │   ├── app.html                        [MODIFIED] Root template
│   │   ├── app.config.ts                   [unchanged]
│   │   ├── app.routes.ts                   [unchanged]
│   │   ├── class.service.ts                [MODIFIED] Extended interface + serialization
│   │   ├── calendar.component.ts           [NEW] Main calendar view
│   │   ├── calendar.component.html         [NEW]
│   │   ├── calendar.component.scss         [NEW]
│   │   ├── edit-class-modal.component.ts   [NEW] Create/edit form
│   │   ├── edit-class-modal.component.html [NEW]
│   │   ├── edit-class-modal.component.scss [NEW]
│   │   ├── conflict-detector.service.ts    [NEW] Overlap detection
│   │   ├── schedule-explorer.component.ts  [NEW] Schedule options UI
│   │   ├── schedule-explorer.component.html[NEW]
│   │   └── schedule-explorer.component.scss[NEW]
│   ├── styles.scss                         [MODIFIED] Global styles
│   ├── main.ts                             [unchanged]
│   ├── index.html                          [unchanged]
│   └── environment.ts                      [unchanged]
├── package.json                            [MODIFIED] Added FullCalendar deps
└── [test files, build config, etc.]
```

## Architecture Decisions

### Why FullCalendar?
- **Rich calendar view**: Week/Day/Month out of box
- **Drag-drop built-in**: No need for separate CDK or ng-dragdrop
- **Production-ready**: Used by thousands of production apps
- **Angular-first**: Official `@fullcalendar/angular` package
- **Extensible**: Custom event rendering, event sources, etc.

### Why Standalone Components?
- **Modern Angular**: No NgModules; cleaner dependency injection
- **Tree-shakable**: Only imported dependencies are bundled
- **Matches existing codebase**: App.ts is already standalone

### Why Event-Based Modal Communication?
- **Loose coupling**: Calendar and modal don't know about each other's internals
- **Reusable**: Modal can be used elsewhere without modification
- **Clear contracts**: `@Output() saved`, `@Output() closed` are explicit

### Why SerializeForBackend()?
- **Defensive**: Prevents accidental persistence of UI-only state
- **Future-proof**: When backend adds fields, just remove from this function
- **Transparent**: Clear to maintainers why some fields are dropped

## Questions & Support

**Q: Can I modify FullCalendar colors/theme?**
A: Yes, edit `.calendar-view ::ng-deep .fc-*` selectors in `calendar.component.scss`

**Q: How do I add more schedule generation algorithms?**
A: Implement in `generateShuffledSchedule()` in `schedule-explorer.component.ts` or call backend solver

**Q: Does drag-drop work on mobile?**
A: FullCalendar's touch support is limited; enhance with `touchstart`/`touchmove` handlers if needed

**Q: Can I export schedules to iCal?**
A: Yes, FullCalendar has export plugins; not implemented yet

