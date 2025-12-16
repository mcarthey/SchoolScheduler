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

  // Calendar grid data
  months = MONTH_NAMES;
  hours: number[] = [];
  grid: CalendarCell[][] = [];
  termDisplays: TermDisplay[] = [];

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
    // Create hours array (8 AM to 4 PM = 8 to 16)
    this.hours = [];
    for (let h = SCHOOL_DAY.startHour; h < SCHOOL_DAY.endHour; h++) {
      this.hours.push(h);
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
    // - Width: all months in its term slot
    // - Height: hours based on duration type (Block=60min=1 hour, Skinny=45min~0.75 hours)
    this.classes.forEach((cls) => {
      const [startMonthNum, endMonthNum] = getTermSlotMonthRange(cls.termSlot);
      const duration = cls.durationType === 'Block' ? 1 : 0.75;
      
      // Place class starting at 8 AM (first available hour)
      const startHour = SCHOOL_DAY.startHour;
      
      for (let m = startMonthNum; m <= endMonthNum; m++) {
        if (m - 1 < this.grid.length) {
          for (let i = 0; i < Math.ceil(duration); i++) {
            const hourIndex = i;
            if (startHour + hourIndex < this.grid[m - 1].length) {
              const cell = this.grid[m - 1][startHour + hourIndex];
              cell.classes.push(cls);
            }
          }
        }
      }
    });

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

  getHourLabel(hour: number): string {
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}${ampm}`;
  }

  onClassClick(cls: ClassModel) {
    this.classClicked.emit(cls);
  }
}
