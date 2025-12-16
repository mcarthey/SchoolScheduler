/**
 * Scheduler configuration for terms, duration types, and school hours.
 * These settings define how classes are scheduled throughout the year.
 */

export const SCHOOL_DAY = {
  startHour: 8,   // 8 AM
  endHour: 16     // 4 PM
};

export interface TermConfig {
  name: string;
  durationMonths: number;
  slots: string[];
}

export interface DurationTypeConfig {
  name: string;
  hours: number;
}

export const TERMS: Record<string, TermConfig> = {
  'Semester': {
    name: 'Semester',
    durationMonths: 5,
    slots: ['S1', 'S2']  // S1: Jan-May, S2: Jun-Oct
  },
  'Half-Semester': {
    name: 'Half-Semester',
    durationMonths: 3,
    slots: ['Q1', 'Q2', 'Q3', 'Q4']  // Quarters
  },
  'Full-Year': {
    name: 'Full-Year',
    durationMonths: 12,
    slots: ['FullYear']  // Entire year
  }
};

export const DURATION_TYPES: Record<string, DurationTypeConfig> = {
  'Block': {
    name: 'Block',
    hours: 1  // 60 minutes
  },
  'Skinny': {
    name: 'Skinny',
    hours: 0.75  // 45 minutes
  }
};

/**
 * Get the month range (1-12) for a specific term slot.
 */
export function getTermSlotMonthRange(termSlot: string): [number, number] {
  switch (termSlot) {
    case 'S1': return [1, 5];           // January - May
    case 'S2': return [6, 10];          // June - October
    case 'Q1': return [1, 3];           // January - March
    case 'Q2': return [4, 6];           // April - June
    case 'Q3': return [7, 9];           // July - September
    case 'Q4': return [10, 12];         // October - December
    case 'FullYear': return [1, 12];    // January - December
    default: throw new Error(`Unknown term slot: ${termSlot}`);
  }
}

/**
 * Get all available term slots for a given term name.
 */
export function getTermSlots(termName: string): string[] {
  return TERMS[termName]?.slots ?? [];
}

/**
 * Get the duration in hours for a given duration type.
 */
export function getDurationHours(durationType: string): number {
  return DURATION_TYPES[durationType]?.hours ?? 1;
}

/**
 * Month names for calendar display.
 */
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
