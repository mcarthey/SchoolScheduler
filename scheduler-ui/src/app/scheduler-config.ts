/**
 * Scheduler configuration for terms, duration types, and school hours.
 * These settings define how classes are scheduled throughout the year.
 */

export const SCHOOL_DAY = {
  startHour: 7,   // 7 AM (7:20 start)
  endHour: 15     // 3 PM (2:40 end)
};

/**
 * Daily period slots - a class occupies ONE period slot per day.
 * Each period can have EITHER one Block OR two Skinny classes.
 */
export interface PeriodSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  canHaveSkinny: boolean;
}

export const PERIOD_SLOTS: Record<string, PeriodSlot> = {
  'A': { id: 'A', name: 'Block A', startTime: '7:20', endTime: '8:45', canHaveSkinny: true },
  'Pride': { id: 'Pride', name: 'Pride & RCC', startTime: '8:55', endTime: '9:25', canHaveSkinny: false },
  'B': { id: 'B', name: 'Block B', startTime: '9:35', endTime: '11:00', canHaveSkinny: true },
  'Lunch': { id: 'Lunch', name: 'Lunch', startTime: '11:00', endTime: '11:35', canHaveSkinny: false },
  'C': { id: 'C', name: 'Block C', startTime: '11:40', endTime: '13:05', canHaveSkinny: true },
  'D': { id: 'D', name: 'Block D', startTime: '13:15', endTime: '14:40', canHaveSkinny: true }
};

/**
 * Sub-periods for Skinny classes (first or second half of a Block period)
 */
export const SUB_PERIODS = {
  1: 'First Half',  // e.g., A1, B3, C5, D7
  2: 'Second Half'  // e.g., A2, B4, C6, D8
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
