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
          termSlot: 'S1',
          durationType: 'Block',
          priority: 5
        }
      ];
      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });

    it('should return empty array for current stubbed implementation', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          termSlot: 'S1',
          durationType: 'Block',
          priority: 5
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          termSlot: 'S1',
          durationType: 'Block',
          priority: 7
        }
      ];

      const conflicts = service.detectConflicts(classes);
      // Current implementation returns empty array (stubbed)
      expect(conflicts).toEqual([]);
    });

    it('should handle classes in different term slots', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          termSlot: 'S1',
          durationType: 'Block',
          priority: 5
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          termSlot: 'S2',
          durationType: 'Block',
          priority: 7
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });

    it('should handle classes with different duration types', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          termSlot: 'S1',
          durationType: 'Block',
          priority: 5
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Semester',
          termSlot: 'S1',
          durationType: 'Skinny',
          priority: 7
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });

    it('should handle multiple classes across different terms', () => {
      const classes: ClassModel[] = [
        {
          id: 1,
          name: 'English 101',
          term: 'Semester',
          termSlot: 'S1',
          durationType: 'Block',
          priority: 5
        },
        {
          id: 2,
          name: 'Math 101',
          term: 'Half-Semester',
          termSlot: 'Q1',
          durationType: 'Block',
          priority: 7
        },
        {
          id: 3,
          name: 'Science 101',
          term: 'Full-Year',
          termSlot: 'FullYear',
          durationType: 'Skinny',
          priority: 6
        }
      ];

      const conflicts = service.detectConflicts(classes);
      expect(conflicts).toEqual([]);
    });
  });
});
