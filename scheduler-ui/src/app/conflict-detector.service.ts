import { Injectable } from '@angular/core';
import { ClassModel } from './class.service';

export interface ClassConflict {
  classId1: number;
  classId2: number;
  className1: string;
  className2: string;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class ConflictDetectorService {
  /**
   * Detects all conflicts (overlapping term slots) in a list of classes.
   * TODO: Implement conflict detection for term slot-based scheduling.
   * Currently returns empty array - will detect overlapping term slots.
   */
  detectConflicts(classes: ClassModel[]): ClassConflict[] {
    // Placeholder: will be reimplemented for calendar view
    return [];
  }
}
