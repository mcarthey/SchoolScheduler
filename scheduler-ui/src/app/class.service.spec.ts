import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClassService, ClassModel } from './class.service';
import { environment } from './environment';
import { expect } from 'vitest';

describe('ClassService', () => {
  let service: ClassService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ClassService
      ]
    });
    service = TestBed.inject(ClassService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch classes from API', () => {
    const mockClasses: ClassModel[] = [
      {
        id: 1,
        name: 'English 10',
        term: 'Semester',
        durationType: 'Block',
        startDate: '2025-09-01',
        endDate: '2026-01-20',
        minutesPerSession: 80,
        priority: 5
      }
    ];

    service.getClasses().subscribe(classes => {
      expect(classes).toEqual(mockClasses);
      expect(classes.length).toBe(1);
      expect(classes[0].name).toBe('English 10');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClasses);
  });

  it('should add a class via POST', () => {
    const newClass: ClassModel = {
      name: 'Math 11',
      term: 'Semester',
      durationType: 'Block',
      startDate: '2025-09-01',
      endDate: '2026-01-20',
      minutesPerSession: 90,
      priority: 8
    };

    const createdClass: ClassModel = { ...newClass, id: 2 };

    service.addClass(newClass).subscribe(result => {
      expect(result).toEqual(createdClass);
      expect(result.id).toBe(2);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newClass);
    req.flush(createdClass);
  });

  it('should handle HTTP errors gracefully', () => {
    service.getClasses().subscribe({
      next: () => {
        throw new Error('should have failed with 500 error');
      },
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/classes`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
