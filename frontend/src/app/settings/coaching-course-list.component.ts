import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { GenericMasterListComponent } from './generic-master-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, GenericMasterListComponent],
  template: `
    <app-generic-master-list
      title="Coaching Course Management"
      description="Manage courses for the Coaching program (e.g. IELTS, TOEFL)."
      itemName="Course"
      idField="course_id"
      [loadFn]="loadFn"
      [saveFn]="saveFn"
      [deleteFn]="deleteFn"
    ></app-generic-master-list>
  `
})
export class CoachingCourseListComponent {
  loadFn = () => this.settingsService.getCoachingCourses();
  saveFn = (data: any) => this.settingsService.saveCoachingCourse(data);
  deleteFn = (id: number) => this.settingsService.deleteCoachingCourse(id);

  constructor(private settingsService: SettingsService) {}
}
