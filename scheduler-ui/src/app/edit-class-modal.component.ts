import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassModel, ClassService } from './class.service';
import { TERMS, DURATION_TYPES, getTermSlots } from './scheduler-config';

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
    termSlot: 'S1',
    periodSlot: 'A',
    durationType: 'Block',
    priority: 5
  };

  errors: { [key: string]: string } = {};
  isSaving = false;

  // Configuration from scheduler-config
  terms = TERMS;
  durationTypes = DURATION_TYPES;
  availableTermSlots: string[] = ['S1', 'S2'];

  constructor(private classService: ClassService) {}

  ngOnInit() {
    if (this.class) {
      this.form = { ...this.class };
      this.updateAvailableSlots();
    }
  }

  onTermChange() {
    this.updateAvailableSlots();
    // Reset term slot to first available
    if (this.availableTermSlots.length > 0) {
      this.form.termSlot = this.availableTermSlots[0];
    }
  }

  private updateAvailableSlots() {
    this.availableTermSlots = getTermSlots(this.form.term);
  }

  isDaySelected(dayNum: number): boolean {
    return false;  // Not used with new term slot approach
  }

  validate(): boolean {
    this.errors = {};

    if (!this.form.name || this.form.name.trim() === '') {
      this.errors['name'] = 'Class name is required';
    }
    if (!this.form.termSlot) {
      this.errors['termSlot'] = 'Term slot is required';
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
