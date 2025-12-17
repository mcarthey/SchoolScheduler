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
    this.loadSessionFromLocalStorage();
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
    this.saveSessionToLocalStorage(); // Auto-save on change
  }

  removeCourseFromYear(yearIndex: number, course: Course) {
    this.yearPlans[yearIndex].selectedCourses = 
      this.yearPlans[yearIndex].selectedCourses.filter(c => c.id !== course.id);
    this.updateYearCredits();
    this.validateAllYears();
    this.saveSessionToLocalStorage(); // Auto-save on change
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

  toggleSection(section: 'graduation' | 'selected' | 'validation') {
    this.sectionsCollapsed[section] = !this.sectionsCollapsed[section];
  }

  collapseAll() {
    this.sectionsCollapsed.graduation = true;
    this.sectionsCollapsed.selected = true;
    this.sectionsCollapsed.validation = true;
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

  // ===== LOCAL STORAGE SESSION MANAGEMENT =====
  
  private saveSessionToLocalStorage() {
    const session = {
      studentName: this.studentName,
      currentGrade: this.currentGrade,
      schoolYear: this.schoolYear,
      currentYearIndex: this.currentYearIndex,
      yearPlans: this.yearPlans.map(year => ({
        gradeLevel: year.gradeLevel,
        gradeName: year.gradeName,
        selectedCourseIds: year.selectedCourses.map(c => c.id),
        totalCredits: year.totalCredits
      })),
      sectionsCollapsed: this.sectionsCollapsed,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('ohs-course-planner-session', JSON.stringify(session));
    console.log('Session auto-saved to localStorage');
  }

  private loadSessionFromLocalStorage() {
    const savedSession = localStorage.getItem('ohs-course-planner-session');
    if (!savedSession) {
      console.log('No saved session found');
      return;
    }

    try {
      const session = JSON.parse(savedSession);
      
      // Restore student info
      this.studentName = session.studentName || '';
      this.currentGrade = session.currentGrade || 9;
      this.schoolYear = session.schoolYear || '2025-2026';
      this.currentYearIndex = session.currentYearIndex || 0;
      
      // Restore collapsed state
      if (session.sectionsCollapsed) {
        this.sectionsCollapsed = session.sectionsCollapsed;
      }

      // Wait for courses to load before restoring selections
      const restoreInterval = setInterval(() => {
        if (this.courses.length > 0) {
          clearInterval(restoreInterval);
          this.restoreYearPlans(session.yearPlans);
          console.log('Session restored from localStorage', new Date(session.lastSaved));
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => clearInterval(restoreInterval), 10000);
      
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  private restoreYearPlans(savedYearPlans: any[]) {
    if (!savedYearPlans || !Array.isArray(savedYearPlans)) return;

    savedYearPlans.forEach((savedYear, index) => {
      if (index >= this.yearPlans.length) return;
      
      const year = this.yearPlans[index];
      year.selectedCourses = [];
      
      if (savedYear.selectedCourseIds && Array.isArray(savedYear.selectedCourseIds)) {
        savedYear.selectedCourseIds.forEach((courseId: number) => {
          const course = this.courses.find(c => c.id === courseId);
          if (course) {
            year.selectedCourses.push(course);
          }
        });
      }
    });

    this.updateYearCredits();
    this.applyFilters();
  }

  clearSession() {
    if (confirm('Clear your current session? This will remove all selected courses but keep saved plans in the database.')) {
      localStorage.removeItem('ohs-course-planner-session');
      
      // Reset to defaults
      this.studentName = '';
      this.currentGrade = 9;
      this.schoolYear = '2025-2026';
      this.currentYearIndex = 0;
      this.yearPlans.forEach(year => year.selectedCourses = []);
      this.updateYearCredits();
      this.validationResult = undefined;
      this.showValidation = false;
      
      alert('Session cleared! Starting fresh.');
    }
  }

  getLastSavedTime(): string {
    const savedSession = localStorage.getItem('ohs-course-planner-session');
    if (!savedSession) return 'Never';
    
    try {
      const session = JSON.parse(savedSession);
      const lastSaved = new Date(session.lastSaved);
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1 minute ago';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return '1 hour ago';
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return 'Unknown';
    }
  }
}
