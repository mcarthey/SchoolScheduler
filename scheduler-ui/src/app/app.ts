import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ScheduleExplorerComponent } from './schedule-explorer.component';
import { CalendarComponent } from './calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, ScheduleExplorerComponent, CalendarComponent],
  template: `<app-schedule-explorer></app-schedule-explorer>`,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }
    `
  ]
})
export class App {}
