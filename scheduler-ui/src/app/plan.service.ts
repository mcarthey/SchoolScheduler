import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface StudentPlan {
  id?: number;
  studentName: string;
  gradeLevel: number;
  schoolYear: string;
  selectedCourseIds: number[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: PlanStatistics;
}

export interface PlanStatistics {
  totalCourses: number;
  totalCredits: number;
  advancedCourses: number;
  totalPeriods: number;
  creditsByDepartment: { [key: string]: number };
  coursesByDuration: { [key: string]: number };
  averageWorkload: number;
  estimatedHomeworkHoursPerWeek: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = `${environment.apiUrl}/api/plans`;

  constructor(private http: HttpClient) {}

  getAllPlans(): Observable<StudentPlan[]> {
    return this.http.get<StudentPlan[]>(this.apiUrl);
  }

  getPlan(id: number): Observable<StudentPlan> {
    return this.http.get<StudentPlan>(`${this.apiUrl}/${id}`);
  }

  createPlan(plan: StudentPlan): Observable<StudentPlan> {
    return this.http.post<StudentPlan>(this.apiUrl, plan);
  }

  updatePlan(id: number, plan: StudentPlan): Observable<StudentPlan> {
    return this.http.put<StudentPlan>(`${this.apiUrl}/${id}`, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  validatePlan(plan: StudentPlan): Observable<PlanValidationResult> {
    return this.http.post<PlanValidationResult>(`${this.apiUrl}/validate`, plan);
  }
}
