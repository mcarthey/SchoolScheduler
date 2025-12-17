import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CourseService, Course } from './course.service';
import { PlanService, StudentPlan, PlanValidationResult } from './plan.service';
import { GraduationTrackerComponent, GraduationRequirements } from './graduation-tracker.component';
import { environment } from './environment';

interface YearPlan {
  gradeLevel: number;
  gradeName: string;
  selectedCourses: Course[];
  totalCredits: number;
}

@Component({
  selector: 'app-course-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, GraduationTrackerComponent],
  templateUrl: './course-planner.component.html',
  styleUrls: ['./course-planner.component.scss']
})
export class CoursePlannerComponent implements OnInit {
  // Data
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  graduationRequirements?: GraduationRequirements;
  
  // 4-Year Planning
  yearPlans: YearPlan[] = [
    { gradeLevel: 9, gradeName: 'Freshman', selectedCourses: [], totalCredits: 0 },
    { gradeLevel: 10, gradeName: 'Sophomore', selectedCourses: [], totalCredits: 0 },
    { gradeLevel: 11, gradeName: 'Junior', selectedCourses: [], totalCredits: 0 },
    { gradeLevel: 12, gradeName: 'Senior', selectedCourses: [], totalCredits: 0 }
  ];
  currentYearIndex = 0; // Start with freshman year
  
  // Combined validation (all 4 years)
  validationResult?: PlanValidationResult;

  // Filters
  departments: string[] = [];
  selectedDepartment = 'All';
  searchText = '';

  // Student info
  studentName = '';
  schoolYear = '2025-2026';
  currentGrade = 9; // What grade they're in NOW

  // UI state
  loading = false;
  showValidation = false;
  
  // Collapsible sections state
  sectionsCollapsed = {
    graduation: false,  // Start expanded (most important)
    actions: true,      // Start collapsed (less used)
    selected: false,    // Start expanded (need to see selections)
    validation: false   // Start expanded when visible
  };

  constructor(
    private courseService: CourseService,
    private planService: PlanService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadGraduationRequirements();
  }

  loadCourses() {
    this.loading = true;
    console.log('Loading courses from API...'); // Debug log
    
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('Courses loaded:', courses.length, courses); // Debug log
        this.courses = courses;
        this.departments = ['All', ...new Set(courses.map(c => c.department))];
        console.log('Departments:', this.departments); // Debug log
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
        alert('Error loading courses. Please make sure the API is running at https://localhost:7217');
      }
    });
  }

  loadGraduationRequirements() {
    this.http.get<GraduationRequirements>(`${environment.apiUrl}/api/graduation-requirements`).subscribe({
      next: (requirements) => {
        this.graduationRequirements = requirements;
      },
      error: (error) => {
        console.error('Error loading graduation requirements:', error);
        // Non-critical, just log it
      }
    });
  }

  get currentYear(): YearPlan {
    return this.yearPlans[this.currentYearIndex];
  }

  get currentGradeLevel(): number {
    return this.currentYear.gradeLevel;
  }

  selectYear(index: number) {
    this.currentYearIndex = index;
    this.applyFilters(); // Refilter when changing years
  }

  applyFilters() {
    // Set empty array if courses haven't loaded yet (but don't return - still set it)
    if (!this.courses || this.courses.length === 0) {
      this.filteredCourses = [];
      return;
    }

    console.log('Applying filters - courses:', this.courses.length, 'grade:', this.currentGradeLevel);

    let filtered = this.courses;

    // Filter by grade level for current year
    filtered = filtered.filter(c => 
      c.gradeLevels.length === 0 || c.gradeLevels.includes(this.currentGradeLevel)
    );

    console.log('After grade filter:', filtered.length);

    // Filter by department
    if (this.selectedDepartment !== 'All') {
      filtered = filtered.filter(c => c.department === this.selectedDepartment);
    }

    // Filter by search text
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.courseCode?.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search)
      );
    }

    this.filteredCourses = filtered;
    console.log('Filtered courses set:', this.filteredCourses.length);
  }

  isSelected(course: Course): boolean {
    return this.currentYear.selectedCourses.some(c => c.id === course.id);
  }

  toggleCourse(course: Course) {
    if (this.isSelected(course)) {
      this.currentYear.selectedCourses = this.currentYear.selectedCourses.filter(c => c.id !== course.id);
    } else {
      this.currentYear.selectedCourses.push(course);
    }
    this.updateYearCredits();
    this.validateAllYears();
  }

  removeCourseFromYear(yearIndex: number, course: Course) {
    this.yearPlans[yearIndex].selectedCourses = 
      this.yearPlans[yearIndex].selectedCourses.filter(c => c.id !== course.id);
    this.updateYearCredits();
    this.validateAllYears();
  }

  updateYearCredits() {
    this.yearPlans.forEach(year => {
      year.totalCredits = year.selectedCourses.reduce((sum, c) => sum + c.credits, 0);
    });
  }

  getAllSelectedCourses(): Course[] {
    return this.yearPlans.flatMap(year => year.selectedCourses);
  }

  getTotalCreditsAllYears(): number {
    return this.yearPlans.reduce((sum, year) => sum + year.totalCredits, 0);
  }

  getCreditsByDepartment(): { [key: string]: number } {
    const credits: { [key: string]: number } = {};
    this.getAllSelectedCourses().forEach(course => {
      credits[course.department] = (credits[course.department] || 0) + course.credits;
    });
    return credits;
  }

  validateAllYears() {
    const allCourses = this.getAllSelectedCourses();
    if (allCourses.length === 0) {
      this.validationResult = undefined;
      this.showValidation = false;
      return;
    }

    const plan: StudentPlan = {
      studentName: this.studentName || 'Student',
      gradeLevel: this.currentGrade,
      schoolYear: this.schoolYear,
      selectedCourseIds: allCourses.map(c => c.id!),
    };

    this.planService.validatePlan(plan).subscribe({
      next: (result) => {
        this.validationResult = result;
        this.showValidation = true;
      },
      error: (error) => {
        console.error('Error validating plan:', error);
      }
    });
  }

  savePlan() {
    if (!this.studentName) {
      alert('Please enter your name');
      return;
    }

    const plan: StudentPlan = {
      studentName: this.studentName,
      gradeLevel: this.currentGrade,
      schoolYear: this.schoolYear,
      selectedCourseIds: this.getAllSelectedCourses().map(c => c.id!),
      notes: this.generatePlanNotes()
    };

    this.planService.createPlan(plan).subscribe({
      next: (saved) => {
        alert(`4-Year Plan saved successfully! (ID: ${saved.id})`);
      },
      error: (error) => {
        console.error('Error saving plan:', error);
        alert('Error saving plan. Please try again.');
      }
    });
  }

  generatePlanNotes(): string {
    return this.yearPlans.map(year => 
      `${year.gradeName} (${year.gradeLevel}th): ${year.selectedCourses.map(c => c.name).join(', ')}`
    ).join(' | ');
  }

  clearYear(yearIndex: number) {
    if (confirm(`Clear all courses for ${this.yearPlans[yearIndex].gradeName} year?`)) {
      this.yearPlans[yearIndex].selectedCourses = [];
      this.updateYearCredits();
      this.validateAllYears();
    }
  }

  clearAll() {
    if (confirm('Clear ALL courses from all 4 years?')) {
      this.yearPlans.forEach(year => year.selectedCourses = []);
      this.updateYearCredits();
      this.validationResult = undefined;
      this.showValidation = false;
    }
  }

  getCourseBadgeClass(course: Course): string {
    if (course.isAdvanced) return 'badge-ap';
    if (course.blockType === 'Skinny') return 'badge-skinny';
    return 'badge-block';
  }

  getDepartmentColor(dept: string): string {
    const colors: { [key: string]: string } = {
      'English': 'dept-english',
      'Math': 'dept-math',
      'Science': 'dept-science',
      'Social Studies': 'dept-social',
      'World Language': 'dept-language',
      'Art': 'dept-art',
      'Physical Education': 'dept-pe',
      'Health': 'dept-health'
    };
    return colors[dept] || 'dept-other';
  }

  getWorkloadStars(level: number): string {
    return '⭐'.repeat(level);
  }

  getYearStatusClass(year: YearPlan): string {
    if (year.selectedCourses.length === 0) return 'empty';
    if (year.totalCredits >= 6) return 'complete';
    return 'partial';
  }

  toggleSection(section: 'graduation' | 'actions' | 'selected' | 'validation') {
    this.sectionsCollapsed[section] = !this.sectionsCollapsed[section];
  }

  getDepartmentProgress() {
    if (!this.graduationRequirements) return [];
    
    return Object.entries(this.graduationRequirements.requiredCreditsByDepartment).map(([dept, required]) => {
      const earned = this.getCreditsByDepartment()[dept] || 0;
      return {
        department: dept,
        required,
        earned,
        remaining: Math.max(0, required - earned),
        complete: earned >= required
      };
    });
  }

  getCompleteDepartmentCount(): number {
    return this.getDepartmentProgress().filter(d => d.complete).length;
  }

  getTotalDepartmentCount(): number {
    return this.getDepartmentProgress().length;
  }
}
