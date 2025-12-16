import { Component, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassModel, ClassService } from './class.service';
import { ClassConflict, ConflictDetectorService } from './conflict-detector.service';
import { EditClassModalComponent } from './edit-class-modal.component';

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
  imports: [CommonModule, EditClassModalComponent],
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

  constructor(
    private classService: ClassService,
    private conflictDetector: ConflictDetectorService
  ) {}

  ngOnInit() {
    this.loadClasses();
  }

  ngOnChanges() {
    this.generateSchedules();
  }

  private loadClasses() {
    this.classService.getClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.conflicts = this.conflictDetector.detectConflicts(classes);
        this.generateSchedules();
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
        classes: this.generateShuffledSchedule(),
        conflicts: [],
        score: 95
      },
      {
        id: 'alternative',
        name: '✓ Good Alternative (Stub)',
        description: 'Slightly different configuration with similar results',
        classes: this.generateShuffledSchedule(),
        conflicts: [],
        score: 85
      },
      {
        id: 'with_conflicts',
        name: '⚠️ Close But Conflicts (Stub)',
        description: 'Resolves some scheduling constraints but introduces conflicts',
        classes: this.generateShuffledSchedule(),
        conflicts: this.generateFakeConflict(),
        score: 70
      }
    ];
  }

  /**
   * Stub: shuffle meeting days to simulate a different schedule.
   * In production, this would come from a solver algorithm.
   */
  private generateShuffledSchedule(): ClassModel[] {
    return this.classes.map((c) => ({
      ...c,
      daysOfWeek: this.randomDays()
    }));
  }

  private randomDays(): number[] {
    const availableDays = [1, 2, 3, 4, 5]; // Mon-Fri
    const count = Math.random() > 0.5 ? 2 : 3;
    const days: number[] = [];
    for (let i = 0; i < count; i++) {
      const day = availableDays[Math.floor(Math.random() * availableDays.length)];
      if (!days.includes(day)) {
        days.push(day);
      }
    }
    return days.sort();
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

  openNewClassModal() {
    this.editingClass = {
      name: '',
      term: 'Semester',
      durationType: 'Block',
      startTime: '09:00',
      daysOfWeek: [1, 3],
      priority: 5
    };
    this.showEditModal = true;
  }

  onClassSaved(savedClass: ClassModel) {
    const index = this.classes.findIndex(c => c.id === savedClass.id);
    if (index >= 0) {
      this.classes[index] = savedClass;
    } else {
      this.classes.push(savedClass);
    }
    this.conflicts = this.conflictDetector.detectConflicts(this.classes);
    this.generateSchedules();
    this.showEditModal = false;
    this.editingClass = null;
  }

  onModalClosed() {
    this.showEditModal = false;
    this.editingClass = null;
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

  formatDays(days?: number[]): string {
    if (!days || days.length === 0) return '—';
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((d) => names[d]).join(', ');
  }

  getPriorityColor(priority: number): string {
    if (priority >= 8) return '#4CAF50'; // Green
    if (priority >= 5) return '#2196F3'; // Blue
    return '#FF9800'; // Orange
  }
}
