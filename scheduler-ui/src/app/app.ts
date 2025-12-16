import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CalendarComponent } from './calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, CalendarComponent],
  template: `<app-calendar></app-calendar>`,
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
