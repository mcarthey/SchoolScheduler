import { describe, it, expect, beforeEach } from 'vitest';
import { ScheduleExplorerComponent } from './schedule-explorer.component';
import { ClassModel } from './class.service';
import { ClassConflict } from './conflict-detector.service';

describe('ScheduleExplorerComponent', () => {
  let component: ScheduleExplorerComponent;

  beforeEach(() => {
    component = new ScheduleExplorerComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty schedules', () => {
    expect(component.schedules).toEqual([]);
    expect(component.selectedScheduleId).toBe('current');
  });

  it('should generate schedules on init', () => {
    component.classes = [
      {
        id: 1,
        name: 'English 101',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        minutesPerSession: 60,
        priority: 5,
        daysOfWeek: [1, 3],
        startTime: '09:00',
        endTime: '10:00'
      }
    ];

    component.ngOnInit();

    expect(component.schedules.length).toBeGreaterThan(0);
    expect(component.schedules[0].id).toBe('current');
  });

  it('should generate current schedule with provided classes and conflicts', () => {
    const mockClasses: ClassModel[] = [
      {
        id: 1,
        name: 'English 101',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        minutesPerSession: 60,
        priority: 5,
        daysOfWeek: [1, 3],
        startTime: '09:00',
        endTime: '10:00'
      }
    ];

    const mockConflicts: ClassConflict[] = [
      {
        classId1: 1,
        classId2: 2,
        className1: 'English 101',
        className2: 'Math 101',
        reason: 'Conflict'
      }
    ];

    component.classes = mockClasses;
    component.conflicts = mockConflicts;
    component.ngOnInit();

    const currentSchedule = component.schedules.find(s => s.id === 'current');
    expect(currentSchedule).toBeTruthy();
    expect(currentSchedule?.classes).toEqual(mockClasses);
    expect(currentSchedule?.conflicts).toEqual(mockConflicts);
  });

  it('should calculate score based on conflicts', () => {
    component.classes = [
      {
        id: 1,
        name: 'English 101',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        minutesPerSession: 60,
        priority: 5,
        daysOfWeek: [1, 3],
        startTime: '09:00',
        endTime: '10:00'
      }
    ];
    component.conflicts = [];
    component.ngOnInit();

    const currentSchedule = component.schedules.find(s => s.id === 'current');
    expect(currentSchedule?.score).toBe(100);

    // With conflicts
    component.conflicts = [
      {
        classId1: 1,
        classId2: 2,
        className1: 'English 101',
        className2: 'Math 101',
        reason: 'Conflict'
      }
    ];
    component.ngOnChanges();

    const updatedSchedule = component.schedules.find(s => s.id === 'current');
    expect(updatedSchedule?.score).toBe(90); // 100 - 10
  });

  it('should generate stub schedules', () => {
    component.classes = [
      {
        id: 1,
        name: 'English 101',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        minutesPerSession: 60,
        priority: 5,
        daysOfWeek: [1, 3],
        startTime: '09:00',
        endTime: '10:00'
      }
    ];

    component.ngOnInit();

    const bestOption = component.schedules.find(s => s.id === 'best');
    const alternative = component.schedules.find(s => s.id === 'alternative');
    const withConflicts = component.schedules.find(s => s.id === 'with_conflicts');

    expect(bestOption).toBeTruthy();
    expect(bestOption?.score).toBe(95);
    expect(alternative).toBeTruthy();
    expect(alternative?.score).toBe(85);
    expect(withConflicts).toBeTruthy();
    expect(withConflicts?.score).toBe(70);
  });

  it('should select schedule', () => {
    component.ngOnInit();
    
    expect(component.selectedScheduleId).toBe('current');

    component.selectSchedule('best');
    expect(component.selectedScheduleId).toBe('best');
  });

  it('should get selected schedule', () => {
    component.classes = [
      {
        id: 1,
        name: 'English 101',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        minutesPerSession: 60,
        priority: 5
      }
    ];
    component.ngOnInit();

    const selected = component.getSelectedSchedule();
    expect(selected).toBeTruthy();
    expect(selected?.id).toBe('current');

    component.selectSchedule('best');
    const newSelected = component.getSelectedSchedule();
    expect(newSelected?.id).toBe('best');
  });

  describe('Helper Methods', () => {
    it('should return correct score color', () => {
      expect(component.getScoreColor(95)).toBe('#4CAF50'); // Green
      expect(component.getScoreColor(90)).toBe('#4CAF50'); // Green
      expect(component.getScoreColor(85)).toBe('#FFC107'); // Amber
      expect(component.getScoreColor(75)).toBe('#FFC107'); // Amber
      expect(component.getScoreColor(70)).toBe('#FF9800'); // Orange
      expect(component.getScoreColor(50)).toBe('#FF9800'); // Orange
    });

    it('should return correct score label', () => {
      expect(component.getScoreLabel(95)).toBe('Excellent');
      expect(component.getScoreLabel(90)).toBe('Excellent');
      expect(component.getScoreLabel(85)).toBe('Good');
      expect(component.getScoreLabel(75)).toBe('Good');
      expect(component.getScoreLabel(70)).toBe('Fair');
      expect(component.getScoreLabel(50)).toBe('Fair');
    });

    it('should format days correctly', () => {
      expect(component.formatDays([1, 3, 5])).toBe('Mon, Wed, Fri');
      expect(component.formatDays([0, 6])).toBe('Sun, Sat');
      expect(component.formatDays([])).toBe('—');
      expect(component.formatDays(undefined)).toBe('—');
    });

    it('should return correct priority color', () => {
      expect(component.getPriorityColor(10)).toBe('#4CAF50'); // Green
      expect(component.getPriorityColor(8)).toBe('#4CAF50'); // Green
      expect(component.getPriorityColor(7)).toBe('#2196F3'); // Blue
      expect(component.getPriorityColor(5)).toBe('#2196F3'); // Blue
      expect(component.getPriorityColor(4)).toBe('#FF9800'); // Orange
      expect(component.getPriorityColor(1)).toBe('#FF9800'); // Orange
    });
  });

  it('should regenerate schedules on changes', () => {
    component.ngOnInit();
    const initialSchedules = component.schedules.length;

    component.classes = [
      {
        id: 1,
        name: 'New Class',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2024-01-01',
        endDate: '2024-05-01',
        minutesPerSession: 60,
        priority: 5
      }
    ];

    component.ngOnChanges();
    expect(component.schedules.length).toBe(initialSchedules);
    
    const currentSchedule = component.schedules.find(s => s.id === 'current');
    expect(currentSchedule?.classes[0]?.name).toBe('New Class');
  });
});
