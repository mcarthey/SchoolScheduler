import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClassModel, ClassService } from './class.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  standalone: true
})
export class App implements OnInit {
  classes: ClassModel[] = [];

  constructor(private service: ClassService) {}

  ngOnInit() {
    this.service.getClasses().subscribe(x => this.classes = x);
  }

  newClass: ClassModel = {
    name: '',
    term: 'Semester',
    durationType: 'Block',
    startDate: '',
    endDate: '',
    minutesPerSession: 60,
    priority: 5
  };

  addClass() {
    this.service.addClass(this.newClass).subscribe(r => {
      this.classes.push(r);
      this.newClass = { ...this.newClass, name: '' }; // reset name
    });
  }
}
