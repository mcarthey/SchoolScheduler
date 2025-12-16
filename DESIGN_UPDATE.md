# Design Update: Simplified Class Model & Schedule Explorer Focus

**Date:** December 16, 2025  
**Status:** Design Phase

## Overview

Based on feedback, the application design has been refined to:
1. **Simplify the ClassModel** by moving configuration to system level
2. **Emphasize the Schedule Explorer UI** as the primary interface
3. **De-emphasize the Week View** as secondary/optional

---

## Simplified Class Model

### Current (Simplified)
```typescript
{
  id?: number;
  name: string;                   // Class name
  term: string;                   // Reference to term config
  durationType: string;           // Reference to duration config
  startTime: string;              // HH:mm (e.g., "09:00")
  daysOfWeek: number[];           // [0-6] (e.g., [1, 3, 5])
  priority: number;               // 1-10
}
```

### Removed Fields (Moved to Configuration)
- `startDate` → Part of Term configuration
- `endDate` → Part of Term configuration  
- `minutesPerSession` → Part of DurationType configuration

---

## Configuration Model (New)

### Term Configuration
```typescript
{
  id: number;
  name: string;                   // "Semester", "Half-Year", "Full Year"
  startDate: string;              // ISO date
  endDate: string;                // ISO date
}
```

### DurationType Configuration
```typescript
{
  id: number;
  name: string;                   // "Block", "Skinny"
  minutesPerSession: number;      // 60, 45, 90, etc.
}
```

---

## UI Architecture

### Primary Interface: Schedule Explorer
- **Purpose:** Browse, compare, and select optimal class schedules
- **Features:**
  - Display multiple schedule candidates with quality scores
  - Visual comparison of different arrangements
  - One-click selection and optimization
  - Conflict visualization and warnings
  
### Secondary Interface: Calendar View
- **Purpose:** Direct manipulation of class times/days (power users)
- **Status:** Available but not emphasized
- **Note:** Can be accessed as alternative or advanced view

---

## Implementation Roadmap

### Phase 1: Simplify Data Model
- [ ] Update ClassModel to remove startDate, endDate, minutesPerSession
- [ ] Create Term and DurationType configuration models
- [ ] Update backend validation and endpoints
- [ ] Migrate existing test data

### Phase 2: Update Frontend
- [ ] Update edit-class-modal to remove date/duration fields
- [ ] Add configuration management UI (terms, duration types)
- [ ] Enhance schedule-explorer as primary view
- [ ] Update conflict-detector to use configuration

### Phase 3: Polish Schedule Explorer
- [ ] Improve schedule candidate generation algorithm
- [ ] Add filtering/sorting options
- [ ] Implement quality scoring based on priority & conflicts
- [ ] Add import/export schedule functionality

### Phase 4: Styling & UX
- [ ] Align week view styling with schedule explorer theme
- [ ] Ensure consistent color scheme and component library
- [ ] Add detailed tooltips and help text
- [ ] Test accessibility (WCAG 2.1 AA)

---

## API Endpoints (Future State)

```
GET  /api/terms                      # Get term configurations
POST /api/terms                      # Create new term
GET  /api/duration-types             # Get duration type configurations
POST /api/duration-types             # Create duration type

GET  /classes                        # Get all classes
POST /classes                        # Create class
PUT  /classes/{id}                   # Update class
DELETE /classes/{id}                 # Delete class

GET  /schedules/generate             # Generate candidate schedules
GET  /schedules/{id}                 # Get specific schedule
```

---

## Data Flow

```
┌─────────────────────────────────────────────────┐
│  Configuration (Admin)                          │
│  - Terms (Semester, Half-Year, Full Year)      │
│  - Duration Types (Block=60min, Skinny=45min)  │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  ClassModel (Simplified)                        │
│  - name, term, durationType, startTime,        │
│    daysOfWeek, priority                        │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Schedule Explorer (Primary UI)                │
│  - Browse candidate schedules                  │
│  - Quality scoring (priority, conflicts)       │
│  - Selection and optimization                  │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│  Calendar View (Secondary UI)                  │
│  - Alternative view for power users            │
│  - Drag-drop manipulation                      │
└─────────────────────────────────────────────────┘
```

---

## Benefits

1. **Simpler Data Entry:** Classes only need 6 fields instead of 9
2. **Centralized Configuration:** Terms and durations defined once, reused across classes
3. **Better UX:** Schedule Explorer allows users to explore options rather than manual assembly
4. **Maintainability:** Less data per class = fewer validation rules and edge cases
5. **Scalability:** Configuration management enables quick school year setup

---

## Next Steps

1. Update README.md ✅ (completed)
2. Design Term/DurationType endpoints
3. Update ClassModel in backend
4. Refactor frontend components
5. Implement configuration UI
6. Update tests to match new model

---

**Document Status:** Design - Awaiting Implementation
