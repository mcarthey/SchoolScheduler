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
   * Detects all conflicts (overlapping time blocks) in a list of classes.
   * Returns array of conflict pairs with descriptive reasons.
   */
  detectConflicts(classes: ClassModel[]): ClassConflict[] {
    const conflicts: ClassConflict[] = [];

    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const conflict = this.checkConflict(classes[i], classes[j]);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * Checks if two classes conflict.
   * Conflicts occur when:
   * - They share a meeting day (daysOfWeek)
   * - AND their time windows overlap
   */
  private checkConflict(class1: ClassModel, class2: ClassModel): ClassConflict | null {
    // If either class lacks scheduling info, no conflict can be detected
    if (
      !class1.daysOfWeek ||
      !class1.startTime ||
      !class1.endTime ||
      !class2.daysOfWeek ||
      !class2.startTime ||
      !class2.endTime
    ) {
      return null;
    }

    // Check if they share any meeting days
    const sharedDays = class1.daysOfWeek.filter((day) => class2.daysOfWeek!.includes(day));
    if (sharedDays.length === 0) {
      return null;
    }

    // Check if times overlap on shared days
    if (this.timesOverlap(class1.startTime, class1.endTime, class2.startTime, class2.endTime)) {
      return {
        classId1: class1.id || 0,
        classId2: class2.id || 0,
        className1: class1.name,
        className2: class2.name,
        reason: `Conflicts on ${this.dayNames(sharedDays)}: ${class1.startTime}-${class1.endTime} overlaps with ${class2.startTime}-${class2.endTime}`
      };
    }

    return null;
  }

  /**
   * Returns true if two time ranges overlap (HH:mm format).
   */
  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  /**
   * Converts HH:mm to minutes since midnight.
   */
  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Convert day numbers to readable day names.
   */
  private dayNames(days: number[]): string {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((d) => names[d]).join(', ');
  }
}
