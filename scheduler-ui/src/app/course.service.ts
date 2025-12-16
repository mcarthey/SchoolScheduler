import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface Course {
  id?: number;
  name: string;
  courseCode?: string;
  department: string;
  duration: string;
  blockType: string;
  credits: number;
  gradeLevels: number[];
  prerequisiteIds: number[];
  isAdvanced: boolean;
  description?: string;
  periodsRequired: number;
  workloadLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/api/courses`;

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`);
  }

  getCoursesByDepartment(department: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/department/${department}`);
  }

  getCoursesByGrade(gradeLevel: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/grade/${gradeLevel}`);
  }
}
