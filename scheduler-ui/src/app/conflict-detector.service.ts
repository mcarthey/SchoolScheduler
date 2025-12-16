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
   * Detects all conflicts in a list of classes.
   * Classes conflict if they:
   * 1. Overlap in terms (same semester/quarter)
   * 2. Occupy the same period slot
   * 3. Have overlapping durations (Block conflicts with any, Skinny conflicts with same sub-period)
   */
  detectConflicts(classes: ClassModel[]): ClassConflict[] {
    const conflicts: ClassConflict[] = [];

    for (let i = 0; i < classes.length; i++) {
      for (let j = i + 1; j < classes.length; j++) {
        const class1 = classes[i];
        const class2 = classes[j];

        // Check if classes overlap in time (same term and same period)
        if (this.hasTermOverlap(class1, class2) && this.hasPeriodConflict(class1, class2)) {
          conflicts.push({
            classId1: class1.id || 0,
            classId2: class2.id || 0,
            className1: class1.name,
            className2: class2.name,
            reason: this.getConflictReason(class1, class2)
          });
        }
      }
    }

    return conflicts;
  }

  private hasTermOverlap(class1: ClassModel, class2: ClassModel): boolean {
    // Check if terms overlap (e.g., S1 and FullYear overlap, but S1 and S2 don't)
    const term1 = class1.termSlot;
    const term2 = class2.termSlot;

    if (term1 === term2) return true;
    if (term1 === 'FullYear' || term2 === 'FullYear') return true;
    
    // S1 overlaps with Q1 and Q2
    if ((term1 === 'S1' && (term2 === 'Q1' || term2 === 'Q2')) ||
        (term2 === 'S1' && (term1 === 'Q1' || term1 === 'Q2'))) return true;
    
    // S2 overlaps with Q3 and Q4
    if ((term1 === 'S2' && (term2 === 'Q3' || term2 === 'Q4')) ||
        (term2 === 'S2' && (term1 === 'Q3' || term1 === 'Q4'))) return true;

    return false;
  }

  private hasPeriodConflict(class1: ClassModel, class2: ClassModel): boolean {
    // If period slots aren't assigned yet, assume no conflict
    if (!class1.periodSlot || !class2.periodSlot) return false;
    
    // Must be in same period slot
    if (class1.periodSlot !== class2.periodSlot) return false;

    const isClass1Block = class1.durationType === 'Block';
    const isClass2Block = class2.durationType === 'Block';

    // Block conflicts with anything in the same period
    if (isClass1Block || isClass2Block) return true;

    // Both are Skinny - conflict only if same sub-period
    return class1.subPeriod === class2.subPeriod;
  }

  private getConflictReason(class1: ClassModel, class2: ClassModel): string {
    const period = class1.periodSlot;
    const isClass1Block = class1.durationType === 'Block';
    const isClass2Block = class2.durationType === 'Block';

    if (isClass1Block && isClass2Block) {
      return `Both scheduled for Block ${period}`;
    }
    if (isClass1Block) {
      return `${class1.name} (Block ${period}) conflicts with ${class2.name} (Skinny ${period}${class2.subPeriod || ''})`;
    }
    if (isClass2Block) {
      return `${class2.name} (Block ${period}) conflicts with ${class1.name} (Skinny ${period}${class1.subPeriod || ''})`;
    }
    return `Both scheduled for Skinny ${period}${class1.subPeriod || ''}`;
  }
}
