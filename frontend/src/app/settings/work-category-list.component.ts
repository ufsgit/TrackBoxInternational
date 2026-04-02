import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { GenericMasterListComponent } from './generic-master-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, GenericMasterListComponent],
  template: `
    <app-generic-master-list
      title="Work Categories"
      description="Manage categories for Work permits and employment programs."
      itemName="Work Category"
      idField="work_cat_id"
      [loadFn]="loadFn"
      [saveFn]="saveFn"
      [deleteFn]="deleteFn"
    ></app-generic-master-list>
  `
})
export class WorkCategoryListComponent {
  loadFn = () => this.settingsService.getWorkCategories();
  saveFn = (data: any) => this.settingsService.saveWorkCategory(data);
  deleteFn = (id: number) => this.settingsService.deleteWorkCategory(id);

  constructor(private settingsService: SettingsService) {}
}
