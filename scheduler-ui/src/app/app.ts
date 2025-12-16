import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoursePlannerComponent } from './course-planner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, CoursePlannerComponent],
  template: `<app-course-planner></app-course-planner>`,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        overflow-x: hidden;
        overflow-y: auto;
      }
    `
  ]
})
export class App {}
