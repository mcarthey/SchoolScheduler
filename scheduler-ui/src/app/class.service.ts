import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface ClassModel {
  id?: number;
  name: string;
  term: string;                    // "Semester", "Half-Semester", or "Full-Year"
  termSlot: string;                // "S1", "S2", "Q1", "Q2", "Q3", "Q4", "FullYear" (when during the year)
  periodSlot?: string;             // "A", "B", "C", "D", "Pride", "Lunch" (which daily period) - optional for now
  durationType: string;            // "Block" (full period) or "Skinny" (half period)
  subPeriod?: number;              // 1 or 2 (for Skinny classes only - which half)
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
    if (model.id && model.id > 0) {
      return this.updateClass(model);
    } else {
      // Remove ID for new classes to prevent duplicate key errors
      const { id, ...modelWithoutId } = model;
      return this.addClass(modelWithoutId as ClassModel);
    }
  }

  updateClass(model: ClassModel): Observable<ClassModel> {
    // Use POST endpoint which now handles both create and update
    return this.http.post<ClassModel>(this.apiUrl, this.serializeForBackend(model));
  }

  deleteClass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // No serialization needed - all fields are persisted
  private serializeForBackend(model: ClassModel): Partial<ClassModel> {
    return model;
  }
}
