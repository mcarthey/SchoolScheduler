import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GraduationRequirements {
  requiredCreditsByDepartment: { [key: string]: number };
  totalCreditsRequired: number;
  recommendedCoursesByGrade: { [key: number]: string[] };
  expectedCreditsByGrade: { [key: number]: number };
  collegeRecommendations: { [key: string]: string };
}

export interface DepartmentProgress {
  department: string;
  required: number;
  earned: number;
  remaining: number;
  complete: boolean;
}

@Component({
  selector: 'app-graduation-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="graduation-tracker">
      <h3>📊 Graduation Progress</h3>
      
      <div class="overall-progress">
        <div class="progress-header">
          <span>Overall Progress</span>
          <span class="credits">{{ totalCredits }} / {{ requirements.totalCreditsRequired }} credits</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="getProgressPercentage()"
            [class.on-track]="isOnTrack()"
            [class.behind]="!isOnTrack()">
          </div>
        </div>
        <p class="progress-status" [class.on-track]="isOnTrack()" [class.behind]="!isOnTrack()">
          {{ getStatusMessage() }}
        </p>
      </div>

      <div class="department-requirements">
        <h4>Requirements by Department</h4>
        <div class="requirement-list">
          <div 
            *ngFor="let dept of getDepartmentProgress()" 
            class="requirement-item"
            [class.complete]="dept.complete">
            <div class="req-header">
              <span class="dept-name">{{ dept.department }}</span>
              <span class="dept-credits">
                {{ dept.earned }} / {{ dept.required }} credits
                <span class="checkmark" *ngIf="dept.complete">✓</span>
              </span>
            </div>
            <div class="req-bar">
              <div 
                class="req-fill" 
                [style.width.%]="getDeptPercentage(dept)"
                [class.complete]="dept.complete">
              </div>
            </div>
            <p class="remaining" *ngIf="!dept.complete && dept.remaining > 0">
              {{ dept.remaining }} credits remaining
            </p>
          </div>
        </div>
      </div>

      <div class="recommendations" *ngIf="gradeLevel">
        <h4>💡 Recommended for Grade {{ gradeLevel }}</h4>
        <ul class="recommendation-list">
          <li *ngFor="let course of getRecommendations()">{{ course }}</li>
        </ul>
      </div>

      <div class="college-tips" *ngIf="showCollegeTips">
        <h4>🎓 College Admission Tips</h4>
        <div class="tip-item" *ngFor="let tip of requirements.collegeRecommendations | keyvalue">
          <strong>{{ tip.key }}:</strong>
          <p>{{ tip.value }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .graduation-tracker {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        color: #2d3748;
      }

      h4 {
        margin: 1rem 0 0.75rem 0;
        color: #4a5568;
        font-size: 1rem;
      }
    }

    .overall-progress {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 6px;

      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #2d3748;

        .credits {
          color: #667eea;
        }
      }

      .progress-bar {
        height: 24px;
        background: #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 0.5rem;

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;

          &.on-track {
            background: linear-gradient(90deg, #48bb78, #38a169);
          }

          &.behind {
            background: linear-gradient(90deg, #f6ad55, #ed8936);
          }
        }
      }

      .progress-status {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 500;

        &.on-track {
          color: #22543d;
        }

        &.behind {
          color: #744210;
        }
      }
    }

    .department-requirements {
      .requirement-list {
        display: grid;
        gap: 0.75rem;
      }

      .requirement-item {
        padding: 0.75rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        transition: all 0.2s;

        &.complete {
          background: #f0fff4;
          border-color: #48bb78;
        }

        .req-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;

          .dept-name {
            font-weight: 600;
            color: #2d3748;
          }

          .dept-credits {
            font-size: 0.875rem;
            color: #718096;

            .checkmark {
              color: #48bb78;
              margin-left: 0.5rem;
            }
          }
        }

        .req-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;

          .req-fill {
            height: 100%;
            background: #667eea;
            transition: width 0.3s ease;

            &.complete {
              background: #48bb78;
            }
          }
        }

        .remaining {
          margin: 0.5rem 0 0 0;
          font-size: 0.75rem;
          color: #a0aec0;
        }
      }
    }

    .recommendations {
      padding: 1rem;
      background: #edf2f7;
      border-radius: 6px;
      margin-top: 1rem;

      .recommendation-list {
        margin: 0;
        padding-left: 1.5rem;

        li {
          margin-bottom: 0.5rem;
          color: #4a5568;
          line-height: 1.5;
        }
      }
    }

    .college-tips {
      margin-top: 1rem;
      padding: 1rem;
      background: #fffaf0;
      border-radius: 6px;
      border-left: 4px solid #ed8936;

      .tip-item {
        margin-bottom: 0.75rem;

        &:last-child {
          margin-bottom: 0;
        }

        strong {
          color: #744210;
          display: block;
          margin-bottom: 0.25rem;
        }

        p {
          margin: 0;
          color: #4a5568;
          font-size: 0.875rem;
          line-height: 1.5;
        }
      }
    }
  `]
})
export class GraduationTrackerComponent {
  @Input() requirements!: GraduationRequirements;
  @Input() creditsByDepartment: { [key: string]: number } = {};
  @Input() totalCredits: number = 0;
  @Input() gradeLevel?: number;
  @Input() showCollegeTips: boolean = false;

  getProgressPercentage(): number {
    return Math.min(100, (this.totalCredits / this.requirements.totalCreditsRequired) * 100);
  }

  isOnTrack(): boolean {
    if (!this.gradeLevel) return true;
    const expected = this.requirements.expectedCreditsByGrade[this.gradeLevel] || 0;
    return this.totalCredits >= expected;
  }

  getStatusMessage(): string {
    if (!this.gradeLevel) return 'Track your progress by selecting a grade level';
    
    const expected = this.requirements.expectedCreditsByGrade[this.gradeLevel] || 0;
    const diff = this.totalCredits - expected;

    if (diff >= 0) {
      return `✓ On track! You're ${diff > 0 ? diff + ' credits ahead' : 'right on schedule'}.`;
    } else {
      return `⚠ You're ${Math.abs(diff)} credits behind expected progress for grade ${this.gradeLevel}.`;
    }
  }

  getDepartmentProgress(): DepartmentProgress[] {
    return Object.entries(this.requirements.requiredCreditsByDepartment).map(([dept, required]) => {
      const earned = this.creditsByDepartment[dept] || 0;
      return {
        department: dept,
        required,
        earned,
        remaining: Math.max(0, required - earned),
        complete: earned >= required
      };
    });
  }

  getDeptPercentage(dept: DepartmentProgress): number {
    return Math.min(100, (dept.earned / dept.required) * 100);
  }

  getRecommendations(): string[] {
    if (!this.gradeLevel) return [];
    return this.requirements.recommendedCoursesByGrade[this.gradeLevel] || [];
  }
}
