import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ClassService } from './class.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('App', () => {
  let mockClassService: any;

  beforeEach(async () => {
    mockClassService = {
      getClasses: vi.fn().mockReturnValue(of([])),
      addClass: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ClassService, useValue: mockClassService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize with empty classes array', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.classes).toEqual([]);
  });

  it('should fetch classes on init', () => {
    const mockClasses = [
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

    mockClassService.getClasses.mockReturnValue(of(mockClasses));

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.ngOnInit();

    expect(mockClassService.getClasses).toHaveBeenCalled();
    expect(app.classes).toEqual(mockClasses);
  });

  it('should have default newClass values', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.newClass.name).toBe('');
    expect(app.newClass.term).toBe('Semester');
    expect(app.newClass.durationType).toBe('Block');
    expect(app.newClass.minutesPerSession).toBe(60);
    expect(app.newClass.priority).toBe(5);
  });

  it('should add class and reset name', () => {
    const newClass = {
      id: 2,
      name: 'Math 11',
      term: 'Semester',
      durationType: 'Block',
      startDate: '2025-09-01',
      endDate: '2026-01-20',
      minutesPerSession: 90,
      priority: 8
    };

    mockClassService.addClass.mockReturnValue(of(newClass));

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.newClass.name = 'Math 11';
    app.addClass();

    expect(mockClassService.addClass).toHaveBeenCalled();
    expect(app.classes.length).toBe(1);
    expect(app.classes[0]).toEqual(newClass);
    expect(app.newClass.name).toBe('');
  });
});
