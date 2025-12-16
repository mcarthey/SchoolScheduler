import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface ClassModel {
  id?: number;
  name: string;
  term: string;                    // Reference to term config (Semester, Half-Year, Full Year)
  durationType: string;            // Reference to duration type config (Block, Skinny)
  startTime: string;               // HH:mm format (e.g., "09:00")
  daysOfWeek: number[];            // Days 0-6 (Sun-Sat) when class meets
  priority: number;                // 1-10 scheduling priority
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

  saveClass(model: ClassModel): Observable<ClassModel> {
    // If it has an id, it's an update; otherwise, it's new
    return model.id
      ? this.updateClass(model)
      : this.addClass(model);
  }

  updateClass(model: ClassModel): Observable<ClassModel> {
    // TODO: Implement on backend when PUT /classes/{id} is added
    // For now, simulate by POST (will be replaced with proper PATCH/PUT)
    return this.http.post<ClassModel>(this.apiUrl, this.serializeForBackend(model));
  }

  // No serialization needed - all fields are persisted
  private serializeForBackend(model: ClassModel): Partial<ClassModel> {
    return model;
  }
}
