# Quick Reference: Calendar Implementation

## Files Changed Summary

| File | Status | Key Changes |
|------|--------|------------|
| README.md | Modified | Removed merge conflicts; added UI architecture docs |
| app.ts | Modified | Switched from form-based to calendar-based UI |
| app.html | Modified | Removed old form template |
| class.service.ts | Modified | Added UI-only fields (daysOfWeek, startTime, endTime); serialize method |
| calendar.component.ts | **NEW** | Main calendar view (week/day) with conflict detection |
| calendar.component.html | **NEW** | Calendar layout with view switcher and modals |
| calendar.component.scss | **NEW** | Calendar styling |
| edit-class-modal.component.ts | **NEW** | Form for creating/editing classes |
| edit-class-modal.component.html | **NEW** | Form template with day/time pickers |
| edit-class-modal.component.scss | **NEW** | Form styling |
| conflict-detector.service.ts | **NEW** | Service to detect overlapping classes |
| schedule-explorer.component.ts | **NEW** | UI for browsing schedule options |
| schedule-explorer.component.html | **NEW** | Schedule comparison cards |
| schedule-explorer.component.scss | **NEW** | Schedule explorer styling |
| styles.scss | Modified | Added global styles |
| package.json | Modified | Added FullCalendar dependencies |
| IMPLEMENTATION.md | **NEW** | Detailed documentation of all changes |

## Build & Run

```bash
# Install dependencies (includes new FullCalendar packages)
cd scheduler-ui
npm install

# Start dev server
npm run start
```

- Angular app runs on `http://localhost:4200`
- Make sure backend is running on `https://localhost:7217`

## Key Features Implemented

✅ **Calendar View**
- Week view (default) with time grid
- Day view option
- FullCalendar-powered with drag-drop support

✅ **Class Management**
- Add new classes via modal form
- Edit existing classes
- Drag classes to reschedule (persisted to API)
- Validation with error messages

✅ **Conflict Detection**
- Automatic detection of overlapping classes
- Visual indicators (red borders/background)
- Detailed conflict descriptions in warning panel

✅ **Schedule Exploration**
- UI framework for browsing multiple schedule options
- Stubbed generation logic (ready for backend integration)
- Quality scores and conflict summary per option

✅ **UI-Only Fields**
- `daysOfWeek`: Meeting days (0-6 = Sun-Sat)
- `startTime`: Meeting start time (HH:mm)
- `endTime`: Meeting end time (HH:mm)
- Not persisted to backend (will be when backend evolves)

## API Integration

**Backend Endpoints Used:**
- `GET /classes` — Load all classes
- `POST /classes` — Create new class (strips UI-only fields)
- `POST /classes` — Update class (TODO: proper PUT/PATCH)

**Response Contract:**
```typescript
{
  id: number;
  name: string;
  term: "Semester" | "Half" | "Year";
  durationType: "Block" | "Skinny";
  startDate: "YYYY-MM-DD";
  endDate: "YYYY-MM-DD";
  minutesPerSession: number; // 1-600
  priority: number; // 1-10
}
```

**UI Enhancement (Local Only):**
```typescript
{
  ...backendFields,
  daysOfWeek?: [0-6];  // Not sent to API
  startTime?: "HH:mm"; // Not sent to API
  endTime?: "HH:mm";   // Not sent to API
}
```

## Architecture Highlights

### Why These Choices?

**FullCalendar**
- Industry-standard for scheduling UIs
- Rich features: week/day/month views, drag-drop
- Angular-native with `@fullcalendar/angular`
- Extensible for future enhancements

**Standalone Components**
- Modern Angular pattern (no NgModules)
- Tree-shakable dependencies
- Matches existing App.ts pattern

**UI-Only Fields Strategy**
- Maintains backend contract
- Enables calendar rendering without backend changes
- Clear path for future evolution

**Event-Based Communication**
- Modal → Calendar via `@Output` events
- Loose coupling, high reusability
- Explicit contracts (saved, closed)

## Testing Checklist

- [ ] npm install completes without errors
- [ ] npm start runs without console errors
- [ ] Calendar displays seeded "English 10" class
- [ ] + Add Class button opens form modal
- [ ] Form validates all fields (required, date order, time order)
- [ ] Submit creates class visible on calendar
- [ ] Dragging class to different day updates calendar + API
- [ ] Adding conflicting classes shows red indicator + warning
- [ ] Explore Schedules tab shows schedule cards
- [ ] Selecting schedule card shows details

## Next Steps (Future)

1. **Backend Enhancement**
   - Add `daysOfWeek`, `startTime`, `endTime` to ClassModel
   - Implement PUT `/classes/{id}` endpoint
   - Add schedule solver/optimizer service

2. **Frontend Polish**
   - Add visual drag preview (ghost event)
   - Add undo/draft workflow
   - Add timezone support
   - Improve mobile responsiveness

3. **Features**
   - Recurring classes (weekly patterns)
   - Bulk import/export
   - Constraints (no classes before 8 AM, etc.)
   - Priority-based optimization

## Common Questions

**Q: Why do classes get default days/times if not specified?**
A: So they display on calendar immediately. When backend adds these fields, defaults won't be needed.

**Q: Can users see conflicts before saving?**
A: Not yet—would need live validation as form is filled (future enhancement).

**Q: How are multiple schedules generated?**
A: Currently stubbed with random shuffling. Will integrate backend solver once implemented.

**Q: Is data persisted between refreshes?**
A: Yes, to in-memory database. Switch to SQL Server for persistent storage (see README).

**Q: Can I change FullCalendar colors?**
A: Yes, edit the `.fc-*` selectors in `calendar.component.scss` or use FullCalendar's theming.

