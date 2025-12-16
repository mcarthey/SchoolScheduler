import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassService, ClassModel } from './class.service';
import { ConflictDetectorService, ClassConflict } from './conflict-detector.service';
import { EditClassModalComponent } from './edit-class-modal.component';
import { ScheduleExplorerComponent } from './schedule-explorer.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EditClassModalComponent, ScheduleExplorerComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  classes: ClassModel[] = [];
  conflicts: ClassConflict[] = [];
  selectedView: 'week' | 'day' | 'explore' = 'week';
  showEditModal = false;
  editingClass: ClassModel | null = null;

  // Week view data
  weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  timeSlots: string[] = [];
  currentWeekStart = new Date();

  constructor(
    private classService: ClassService,
    private conflictDetector: ConflictDetectorService
  ) {
    this.initializeTimeSlots();
    this.setWeekStart(new Date());
  }

  ngOnInit() {
    this.loadClasses();
  }

  private initializeTimeSlots() {
    // Generate time slots from 7 AM to 7 PM
    for (let hour = 7; hour <= 19; hour++) {
      this.timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 19) {
        this.timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
  }

  private setWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    this.currentWeekStart = new Date(d.setDate(diff));
  }

  private loadClasses() {
    this.classService.getClasses().subscribe({
      next: (classes) => {
        this.classes = this.enrichClassesWithDefaults(classes);
        this.checkConflicts();
      },
      error: (err) => console.error('Failed to load classes:', err)
    });
  }

  private enrichClassesWithDefaults(classes: ClassModel[]): ClassModel[] {
    return classes.map(c => ({
      ...c,
      daysOfWeek: c.daysOfWeek || [1, 3], // Default Mon, Wed
      startTime: c.startTime || '09:00',
      endTime: c.endTime || this.calculateEndTime(c.startTime || '09:00', c.minutesPerSession)
    }));
  }

  private calculateEndTime(startTime: string, minutes: number): string {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  }

  getClassesForDay(dayIndex: number): ClassModel[] {
    return this.classes.filter(c => c.daysOfWeek?.includes(dayIndex));
  }

  getClassPosition(classItem: ClassModel): { top: string; height: string } {
    if (!classItem.startTime || !classItem.endTime) {
      return { top: '0', height: '50px' };
    }

    const startMins = this.timeToMinutes(classItem.startTime);
    const endMins = this.timeToMinutes(classItem.endTime);
    const slotStart = this.timeToMinutes('07:00');
    
    const top = ((startMins - slotStart) / 30) * 50; // 50px per 30-min slot
    const height = ((endMins - startMins) / 30) * 50;
    
    return { top: `${top}px`, height: `${height}px` };
  }

  private timeToMinutes(time: string): number {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
  }

  openNewClassModal() {
    this.editingClass = {
      name: '',
      term: 'Semester',
      durationType: 'Block',
      startDate: '',
      endDate: '',
      minutesPerSession: 60,
      priority: 5,
      daysOfWeek: [1, 3],
      startTime: '09:00',
      endTime: '10:00'
    };
    this.showEditModal = true;
  }

  onClassClick(classItem: ClassModel) {
    this.editingClass = { ...classItem };
    this.showEditModal = true;
  }

  onClassSaved(savedClass: ClassModel) {
    const index = this.classes.findIndex(c => c.id === savedClass.id);
    if (index >= 0) {
      this.classes[index] = savedClass;
    } else {
      this.classes.push(savedClass);
    }
    this.checkConflicts();
    this.showEditModal = false;
    this.editingClass = null;
  }

  onModalClosed() {
    this.showEditModal = false;
    this.editingClass = null;
  }

  switchView(view: 'week' | 'day' | 'explore') {
    this.selectedView = view;
  }

  private checkConflicts() {
    this.conflicts = this.conflictDetector.detectConflicts(this.classes);
  }

  previousWeek() {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    this.setWeekStart(newStart);
  }

  nextWeek() {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.setWeekStart(newStart);
  }

  getWeekDates(): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getPriorityColor(priority: number): string {
    if (priority >= 8) return '#4CAF50';
    if (priority >= 5) return '#2196F3';
    return '#FF9800';
  }

  hasConflict(classItem: ClassModel): boolean {
    return this.conflicts.some(c => 
      c.classId1 === classItem.id || c.classId2 === classItem.id
    );
  }
}
