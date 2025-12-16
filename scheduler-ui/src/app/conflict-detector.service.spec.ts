import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictDetectorService } from './conflict-detector.service';
import { ClassModel } from './class.service';

describe('ConflictDetectorService', () => {
  let service: ConflictDetectorService;

  beforeEach(() => {
    service = new ConflictDetectorService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('detectConflicts', () => {
    it('should return empty array when no classes', () => {
      const conflicts = service.detectConflicts([]);
      expect(conflicts).toEqual([]);
    });

    it('should return empty array when only one class', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 5,
          daysOfWeek: [1, 3],
          startTime: '09:00'
        }
      ];
      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });

    it('should detect conflict when classes overlap on same day and time', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 5,
          daysOfWeek: [1, 3],
          startTime: '09:00'
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 7,
          daysOfWeek: [1, 3],
          startTime: '09:30'
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        classId1: 1,
        classId2: 2,
        className1: 'English 101',
        className2: 'Math 101'
      });
    });

    it('should not detect conflict when classes on different days', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 5,
          daysOfWeek: [1, 3],
          startTime: '09:00'
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 7,
          daysOfWeek: [2, 4],
          startTime: '09:00'
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });

    it('should not detect conflict when classes on same day but different times', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 5,
          daysOfWeek: [1, 3],
          startTime: '09:00'
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 7,
          daysOfWeek: [1, 3],
          startTime: '10:00'
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });

    it('should detect multiple conflicts', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 5,
          daysOfWeek: [1],
          startTime: '09:00'
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 7,
          daysOfWeek: [1],
          startTime: '09:30'
        },
        {
          id: 3,
          name: 'Science 101',
          term: 'Semester',
          durationType: 'Block',
          priority: 6,
          daysOfWeek: [1],
          startTime: '09:15'
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts.length).toBe(3);
    });
  });
});
