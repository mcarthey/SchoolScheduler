import { Component, OnInit, OnChanges, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassModel, ClassService } from './class.service';
import { ClassConflict, ConflictDetectorService } from './conflict-detector.service';
import { EditClassModalComponent } from './edit-class-modal.component';
import { CalendarGridComponent } from './calendar-grid.component';

export interface ScheduleOption {
  id: string;
  name: string;
  description: string;
  classes: ClassModel[];
  conflicts: ClassConflict[];
  score: number; // 0-100: higher is better
}

@Component({
  selector: 'app-schedule-explorer',
  standalone: true,
  imports: [CommonModule, EditClassModalComponent, CalendarGridComponent],
  templateUrl: './schedule-explorer.component.html',
  styleUrls: ['./schedule-explorer.component.scss']
})
export class ScheduleExplorerComponent implements OnInit, OnChanges {
  classes: ClassModel[] = [];
  conflicts: ClassConflict[] = [];

  selectedScheduleId = 'current';
  schedules: ScheduleOption[] = [];

  showEditModal = false;
  editingClass: ClassModel | null = null;
  showTimes = false; // Student view default (no times)

  constructor(
    private classService: ClassService,
    private conflictDetector: ConflictDetectorService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Generate empty schedules first so UI isn't blank while loading
    this.generateSchedules();
    // Then load the actual classes
    this.loadClasses();
  }

  ngOnChanges() {
    this.generateSchedules();
  }

  private loadClasses() {
    this.classService.getClasses().subscribe({
      next: (classes) => {
        this.ngZone.run(() => {
          this.classes = classes;
          this.conflicts = this.conflictDetector.detectConflicts(classes);
          this.generateSchedules();
          this.cdr.markForCheck();
        });
      },
      error: (err) => console.error('Failed to load classes:', err)
    });
  }

  /**
   * Generate candidate schedules (stubbed for now).
   * In a real implementation, this would call a backend optimization service.
   * For the POC, we generate fake schedules to showcase the UI framework.
   */
  private generateSchedules() {
    this.schedules = [
      {
        id: 'current',
        name: '📋 Current Schedule',
        description: this.classes.length + ' classes scheduled',
        classes: this.classes,
        conflicts: this.conflicts,
        score: 100 - Math.max(0, this.conflicts.length * 10)
      },
      {
        id: 'best',
        name: '⭐ Best Option (Stub)',
        description: 'Optimized for minimal conflicts and balanced load',
        classes: this.classes,
        conflicts: [],
        score: 95
      },
      {
        id: 'alternative',
        name: '✓ Good Alternative (Stub)',
        description: 'Slightly different configuration with similar results',
        classes: this.classes,
        conflicts: [],
        score: 85
      },
      {
        id: 'with_conflicts',
        name: '⚠️ Close But Conflicts (Stub)',
        description: 'Resolves some scheduling constraints but introduces conflicts',
        classes: this.classes,
        conflicts: this.generateFakeConflict(),
        score: 70
      }
    ];
  }

  formatDays(days?: number[]): string {
    if (!days || days.length === 0) return '—';
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((d) => names[d]).join(', ');
  }

  private generateFakeConflict(): ClassConflict[] {
    if (this.classes.length < 2) return [];
    return [
      {
        classId1: this.classes[0].id || 0,
        classId2: this.classes[1].id || 0,
        className1: this.classes[0].name,
        className2: this.classes[1].name,
        reason: '(Stub) Classes meet on same day at overlapping times'
      }
    ];
  }

  selectSchedule(id: string) {
    this.selectedScheduleId = id;
  }

  getSelectedSchedule(): ScheduleOption | undefined {
    return this.schedules.find((s) => s.id === this.selectedScheduleId);
  }

  getScoreColor(score: number): string {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 75) return '#FFC107'; // Amber
    return '#FF9800'; // Orange
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Fair';
  }

  getPriorityColor(priority: number): string {
    if (priority >= 8) return '#4CAF50'; // Green
    if (priority >= 5) return '#2196F3'; // Blue
    return '#FF9800'; // Orange
  }

  convertConflicts(): { class1: ClassModel; class2: ClassModel }[] {
    // Convert ClassConflict format to the format expected by calendar-grid
    return this.conflicts.map(conflict => ({
      class1: this.classes.find(c => c.name === conflict.className1) || this.classes[0],
      class2: this.classes.find(c => c.name === conflict.className2) || this.classes[0]
    })).filter(c => c.class1 && c.class2);
  }

  toggleViewMode() {
    this.showTimes = !this.showTimes;
  }

  editClass(cls: ClassModel) {
    this.editingClass = { ...cls };
    this.showEditModal = true;
  }

  openNewClassModal() {
    this.editingClass = {
      name: '',
      term: 'Semester',
      termSlot: 'S1',
      periodSlot: 'A',
      durationType: 'Block',
      priority: 5
    };
    this.showEditModal = true;
  }

  onClassSaved(savedClass: ClassModel) {
    this.classService.saveClass(savedClass).subscribe({
      next: () => {
        this.showEditModal = false;
        this.editingClass = null;
        this.loadClasses(); // Reload to get updated list
      },
      error: (err) => {
        console.error('Failed to save class:', err);
        alert(`Failed to save class: ${err.error || err.message || 'Unknown error'}`);
      }
    });
  }

  deleteClass(cls: ClassModel) {
    if (!cls.id) return;
    
    if (confirm(`Are you sure you want to delete "${cls.name}"?`)) {
      this.classService.deleteClass(cls.id).subscribe({
        next: () => {
          this.loadClasses(); // Reload to get updated list
        },
        error: (err) => {
          console.error('Failed to delete class:', err);
          alert(`Failed to delete class: ${err.error || err.message || 'Unknown error'}`);
        }
      });
    }
  }

  onModalClosed() {
    this.showEditModal = false;
    this.editingClass = null;
  }
}
