import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface ClassModel {
  id?: number;
  name: string;
  term: string;
  durationType: string;
  startDate: string;
  endDate: string;
  minutesPerSession: number;
  priority: number;
  // UI-only fields (not persisted to backend; used for calendar rendering)
  daysOfWeek?: number[]; // 0-6 (Sun-Sat) when class meets
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
}

@Injectable({ providedIn: 'root' })
export class ClassService {
  private apiUrl = environment.apiUrl + '/classes';

  constructor(private http: HttpClient) {}

  getClasses(): Observable<ClassModel[]> {
    return this.http.get<ClassModel[]>(this.apiUrl);
  }

  addClass(model: ClassModel): Observable<ClassModel> {
    return this.http.post<ClassModel>(this.apiUrl, this.serializeForBackend(model));
  }

  updateClass(model: ClassModel): Observable<ClassModel> {
    // TODO: Implement on backend when PUT /classes/{id} is added
    // For now, simulate by POST (will be replaced with proper PATCH/PUT)
    return this.http.post<ClassModel>(this.apiUrl, this.serializeForBackend(model));
  }

  // Remove UI-only fields before sending to backend
  private serializeForBackend(model: ClassModel): Partial<ClassModel> {
    const { daysOfWeek, startTime, endTime, ...backendModel } = model;
    return backendModel;
  }
}
