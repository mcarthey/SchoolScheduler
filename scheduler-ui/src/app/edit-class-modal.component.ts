import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassModel, ClassService } from './class.service';

@Component({
  selector: 'app-edit-class-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-class-modal.component.html',
  styleUrls: ['./edit-class-modal.component.scss']
})
export class EditClassModalComponent implements OnInit {
  @Input() class: ClassModel | null = null;
  @Output() saved = new EventEmitter<ClassModel>();
  @Output() closed = new EventEmitter<void>();

  form: ClassModel = {
    name: '',
    term: 'Semester',
    durationType: 'Block',
    startTime: '09:00',
    daysOfWeek: [1, 3],
    priority: 5
  };

  errors: { [key: string]: string } = {};
  isSaving = false;

  dayLabels = [
    { num: 0, label: 'Sunday' },
    { num: 1, label: 'Monday' },
    { num: 2, label: 'Tuesday' },
    { num: 3, label: 'Wednesday' },
    { num: 4, label: 'Thursday' },
    { num: 5, label: 'Friday' },
    { num: 6, label: 'Saturday' }
  ];

  constructor(private classService: ClassService) {}

  ngOnInit() {
    if (this.class) {
      this.form = { ...this.class };
    }
  }

  toggleDay(dayNum: number) {
    if (!this.form.daysOfWeek) {
      this.form.daysOfWeek = [];
    }
    const index = this.form.daysOfWeek.indexOf(dayNum);
    if (index >= 0) {
      this.form.daysOfWeek.splice(index, 1);
    } else {
      this.form.daysOfWeek.push(dayNum);
      this.form.daysOfWeek.sort();
    }
  }

  isDaySelected(dayNum: number): boolean {
    return this.form.daysOfWeek?.includes(dayNum) || false;
  }

  validate(): boolean {
    this.errors = {};

    if (!this.form.name || this.form.name.trim() === '') {
      this.errors['name'] = 'Class name is required';
    }
    if (!this.form.startTime) {
      this.errors['startTime'] = 'Start time is required';
    }
    if (!this.form.daysOfWeek || this.form.daysOfWeek.length === 0) {
      this.errors['daysOfWeek'] = 'Select at least one meeting day';
    }
    if (!this.form.term) {
      this.errors['term'] = 'Term is required';
    }
    if (!this.form.durationType) {
      this.errors['durationType'] = 'Duration type is required';
    }
    if (this.form.priority < 1 || this.form.priority > 10) {
      this.errors['priority'] = 'Priority must be between 1 and 10';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSubmit() {
    if (!this.validate()) {
      return;
    }

    this.isSaving = true;
    const operation = this.form.id
      ? this.classService.updateClass(this.form)
      : this.classService.addClass(this.form);

    operation.subscribe({
      next: (savedClass) => {
        this.isSaving = false;
        this.saved.emit(savedClass);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Save error:', err);
        this.errors['submit'] =
          err?.error?.message || 'Failed to save class. Please try again.';
      }
    });
  }

  onClose() {
    this.closed.emit();
  }
}
