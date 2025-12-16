import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassModel } from './class.service';
import { 
  TERMS, 
  DURATION_TYPES, 
  SCHOOL_DAY, 
  getTermSlotMonthRange,
  MONTH_NAMES 
} from './scheduler-config';

interface CalendarCell {
  month: number;
  hour: number;
  classes: ClassModel[];
  hasConflict: boolean;
}

interface TermDisplay {
  name: string;
  startMonth: number;
  endMonth: number;
  slots: string[];
  color: string;
}

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-grid.component.html',
  styleUrls: ['./calendar-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarGridComponent implements OnChanges {
  @Input() classes: ClassModel[] = [];
  @Input() conflicts: { class1: ClassModel; class2: ClassModel }[] = [];
  @Output() classClicked = new EventEmitter<ClassModel>();
  // Hide times for student view; show times for admin placement
  @Input() showTimes: boolean = false;

  // Calendar grid data
  months = MONTH_NAMES;
  hours: number[] = [];
  grid: CalendarCell[][] = [];
  termDisplays: TermDisplay[] = [];
  // Classes with no period assignment get shown in this special lane
  unassignedGrid: ClassModel[][] = [];
  hasUnassignedClasses = false;
  
  // Student view: each class gets its own row
  classRows: { class: ClassModel; months: boolean[] }[] = [];

  // Term colors (cycling through a palette)
  private termColors: { [key: string]: string } = {
    'S1': '#FF6B6B', 'S2': '#4ECDC4',
    'Q1': '#45B7D1', 'Q2': '#FFA07A', 'Q3': '#98D8C8', 'Q4': '#F7DC6F',
    'FullYear': '#9B59B6'
  };

  constructor() {
    this.initializeGrid();
    this.initializeTermDisplays();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['classes'] || changes['conflicts']) {
      this.updateGrid();
    }
  }

  private initializeGrid() {
    // Create hours array, or collapse to a single row if times are hidden
    this.hours = [];
    if (this.showTimes) {
      for (let h = SCHOOL_DAY.startHour; h < SCHOOL_DAY.endHour; h++) {
        this.hours.push(h);
      }
    } else {
      // Single synthetic row for student view
      this.hours.push(0);
    }

    // Initialize empty grid (12 months x 8 hours)
    this.grid = [];
    for (let m = 0; m < 12; m++) {
      const monthColumn: CalendarCell[] = [];
      for (let h of this.hours) {
        monthColumn.push({
          month: m,
          hour: h,
          classes: [],
          hasConflict: false
        });
      }
      this.grid.push(monthColumn);
    }
    
    // Initialize unassigned lane (one cell per month)
    this.unassignedGrid = [];
    for (let month = 1; month <= 12; month++) {
      this.unassignedGrid.push([]);
    }
  }

  private initializeTermDisplays() {
    // Display all terms with their month ranges
    this.termDisplays = [];
    
    // Semesters
    const [s1Start, s1End] = getTermSlotMonthRange('S1');
    const [s2Start, s2End] = getTermSlotMonthRange('S2');
    this.termDisplays.push({
      name: 'Semester 1',
      startMonth: s1Start,
      endMonth: s1End,
      slots: ['S1'],
      color: this.termColors['S1']
    });
    this.termDisplays.push({
      name: 'Semester 2',
      startMonth: s2Start,
      endMonth: s2End,
      slots: ['S2'],
      color: this.termColors['S2']
    });

    // Quarters
    for (let i = 1; i <= 4; i++) {
      const slot = `Q${i}`;
      const [start, end] = getTermSlotMonthRange(slot);
      this.termDisplays.push({
        name: `Quarter ${i}`,
        startMonth: start,
        endMonth: end,
        slots: [slot],
        color: this.termColors[slot]
      });
    }

    // Full Year
    const [fyStart, fyEnd] = getTermSlotMonthRange('FullYear');
    this.termDisplays.push({
      name: 'Full Year',
      startMonth: fyStart,
      endMonth: fyEnd,
      slots: ['FullYear'],
      color: this.termColors['FullYear']
    });
  }

  private updateGrid() {
    // Reset grid
    this.initializeGrid();

    // Place classes on the grid
    // Each class occupies:
    // - Width: all months in its term slot (horizontal bar across calendar)
    // - Height: specific time based on periodSlot (same row across all months)
    this.hasUnassignedClasses = false;
    
    if (!this.showTimes) {
      // Student view: each class gets its own dedicated row with a continuous bar
      this.classRows = this.classes.map(cls => {
        const [startMonthNum, endMonthNum] = getTermSlotMonthRange(cls.termSlot);
        const monthFlags = Array(12).fill(false);
        
        // Mark which months this class spans
        for (let m = startMonthNum; m <= endMonthNum; m++) {
          const monthIndex = m - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthFlags[monthIndex] = true;
          }
        }
        
        return { class: cls, months: monthFlags };
      });
    } else {
      // Admin view: show unassigned lane and period rows
      this.classes.forEach((cls) => {
        const [startMonthNum, endMonthNum] = getTermSlotMonthRange(cls.termSlot);
        
        if (!cls.periodSlot) {
          for (let m = startMonthNum; m <= endMonthNum; m++) {
            const monthIndex = m - 1;
            if (monthIndex >= 0 && monthIndex < this.unassignedGrid.length) {
              this.unassignedGrid[monthIndex].push(cls);
              this.hasUnassignedClasses = true;
            }
          }
        } else {
          const periodHour = this.getPeriodStartHour(cls.periodSlot);
          if (periodHour !== null) {
            for (let m = startMonthNum; m <= endMonthNum; m++) {
              const monthIndex = m - 1;
              if (monthIndex >= 0 && monthIndex < this.grid.length) {
                const hourIndex = this.hours.indexOf(periodHour);
                if (hourIndex >= 0 && hourIndex < this.grid[monthIndex].length) {
                  const cell = this.grid[monthIndex][hourIndex];
                  cell.classes.push(cls);
                }
              }
            }
          }
        }
      });
    }

    // Mark conflicts
    this.conflicts.forEach(({ class1, class2 }) => {
      const [range1Start, range1End] = getTermSlotMonthRange(class1.termSlot);
      const [range2Start, range2End] = getTermSlotMonthRange(class2.termSlot);
      
      // Find overlapping months
      const startMonth = Math.max(range1Start, range2Start);
      const endMonth = Math.min(range1End, range2End);
      
      if (startMonth <= endMonth) {
        for (let m = startMonth; m <= endMonth; m++) {
          for (let row of this.grid[m - 1]) {
            if (row.classes.includes(class1) && row.classes.includes(class2)) {
              row.hasConflict = true;
            }
          }
        }
      }
    });
  }

  getClassColor(cls: ClassModel): string {
    return this.termColors[cls.termSlot] || '#95A5A6';
  }

  getPeriodStartHour(periodSlot: string): number | null {
    // Map period slots to their start hour
    // Based on the school schedule:
    // Block A: 7:20-8:45 -> 7
    // Pride: 8:55-9:25 -> 8 (close to 9)
    // Block B: 9:35-11:00 -> 9
    // Lunch: 11:00-11:35 -> 11
    // Block C: 11:40-13:05 -> 11 (close to 12)
    // Block D: 13:15-14:40 -> 13
    
    const periodHours: { [key: string]: number } = {
      'A': 7,
      'Pride': 8,
      'B': 9,
      'Lunch': 11,
      'C': 12,
      'D': 13
    };
    
    return periodHours[periodSlot] ?? null;
  }

  getHourLabel(hour: number): string {
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}${ampm}`;
  }

  onClassClick(cls: ClassModel) {
    this.classClicked.emit(cls);
  }
}
