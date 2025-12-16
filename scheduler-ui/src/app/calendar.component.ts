import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { ClassModel, ClassService } from './class.service';
import { ConflictDetectorService, ClassConflict } from './conflict-detector.service';
import { EditClassModalComponent } from './edit-class-modal.component';
import { ScheduleExplorerComponent } from './schedule-explorer.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    EditClassModalComponent,
    ScheduleExplorerComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  classes: ClassModel[] = [];
  conflicts: ClassConflict[] = [];
  selectedView: 'week' | 'day' | 'explore' = 'week';
  showEditModal = false;
  editingClass: ClassModel | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00',
    slotMaxTime: '19:00',
    slotLabelInterval: '00:30',
    contentHeight: 'auto',
    editable: true,
    eventDrop: (event) => this.onEventDrop(event),
    eventClick: (event) => this.onEventClick(event),
    dateClick: () => this.openNewClassModal()
  };

  constructor(
    private classService: ClassService,
    private conflictDetector: ConflictDetectorService
  ) {}

  ngOnInit() {
    this.loadClasses();
  }

  private loadClasses() {
    this.classService.getClasses().subscribe({
      next: (classes) => {
        this.classes = this.enrichClassesWithDefaults(classes);
        this.updateCalendarEvents();
        this.checkConflicts();
      },
      error: (err) => console.error('Failed to load classes:', err)
    });
  }

  /**
   * Ensure each class has reasonable defaults for calendar display.
   * If a class lacks scheduling info, assign defaults.
   */
  private enrichClassesWithDefaults(classes: ClassModel[]): ClassModel[] {
    return classes.map((c) => ({
      ...c,
      daysOfWeek: c.daysOfWeek || [1, 3], // Default: Mon & Wed
      startTime: c.startTime || '09:00',
      endTime: c.endTime || this.calculateEndTime(c.minutesPerSession)
    }));
  }

  private calculateEndTime(minutesPerSession: number): string {
    const startMins = 9 * 60; // 09:00
    const endMins = startMins + minutesPerSession;
    const hours = Math.floor(endMins / 60);
    const mins = endMins % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Convert ClassModel array to FullCalendar events.
   */
  private updateCalendarEvents() {
    const events = this.classes.map((c) => ({
      id: `${c.id}`,
      title: c.name,
      daysOfWeek: c.daysOfWeek || [1, 3],
      startTime: c.startTime || '09:00',
      endTime: c.endTime || '10:00',
      backgroundColor: this.getEventColor(c),
      borderColor: this.getEventBorderColor(c),
      extendedProps: { classModel: c }
    }));

    this.calendarOptions.events = events;
  }

  /**
   * Get background color for event, based on priority and conflicts.
   */
  private getEventColor(classModel: ClassModel): string {
    // Check if involved in conflict
    const hasConflict = this.conflicts.some(
      (c) => c.classId1 === classModel.id || c.classId2 === classModel.id
    );
    if (hasConflict) {
      return '#ff9999'; // Light red for conflicts
    }

    // Color by priority
    if (classModel.priority >= 8) return '#4CAF50'; // Green
    if (classModel.priority >= 5) return '#2196F3'; // Blue
    return '#FF9800'; // Orange
  }

  private getEventBorderColor(classModel: ClassModel): string {
    const hasConflict = this.conflicts.some(
      (c) => c.classId1 === classModel.id || c.classId2 === classModel.id
    );
    return hasConflict ? '#d32f2f' : '#333'; // Dark red border for conflicts
  }

  private checkConflicts() {
    this.conflicts = this.conflictDetector.detectConflicts(this.classes);
  }

  openNewClassModal() {
    this.editingClass = {
      name: '',
      term: 'Semester',
      durationType: 'Block',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      minutesPerSession: 60,
      priority: 5,
      daysOfWeek: [1, 3],
      startTime: '09:00',
      endTime: '10:00'
    };
    this.showEditModal = true;
  }

  onEventClick(event: EventClickArg) {
    this.editingClass = event.event.extendedProps.classModel;
    this.showEditModal = true;
  }

  onEventDrop(event: EventDropArg) {
    const classModel = event.event.extendedProps.classModel as ClassModel;
    if (event.event.start) {
      const dayOfWeek = event.event.start.getDay();
      classModel.daysOfWeek = [dayOfWeek];

      // Update backend
      this.classService.updateClass(classModel).subscribe({
        next: () => {
          console.log('Class rescheduled:', classModel.name);
          this.checkConflicts();
        },
        error: (err) => {
          console.error('Failed to update class:', err);
          // Reload to revert UI change
          this.loadClasses();
        }
      });
    }
  }

  onClassSaved(savedClass: ClassModel) {
    const existingIndex = this.classes.findIndex((c) => c.id === savedClass.id);
    if (existingIndex >= 0) {
      this.classes[existingIndex] = savedClass;
    } else {
      this.classes.push(savedClass);
    }
    this.updateCalendarEvents();
    this.checkConflicts();
    this.showEditModal = false;
  }

  onModalClosed() {
    this.showEditModal = false;
    this.editingClass = null;
  }

  switchView(view: 'week' | 'day' | 'explore') {
    this.selectedView = view;
  }
}
