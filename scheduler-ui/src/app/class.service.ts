import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface ClassModel {
  id?: number;
  name: string;
  term: string;                    // "Semester", "Half-Semester", or "Full-Year"
  termSlot: string;                // "S1", "S2", "Q1", "Q2", "Q3", "Q4", "FullYear"
  durationType: string;            // "Block" (1 hour) or "Skinny" (45 minutes)
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
