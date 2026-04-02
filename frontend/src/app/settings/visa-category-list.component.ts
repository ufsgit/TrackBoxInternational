import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { GenericMasterListComponent } from './generic-master-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, GenericMasterListComponent],
  template: `
    <app-generic-master-list
      title="Visa Categories"
      description="Manage visa types (e.g. Tourist, Business, Student Visa)."
      itemName="Visa Category"
      idField="visa_cat_id"
      [loadFn]="loadFn"
      [saveFn]="saveFn"
      [deleteFn]="deleteFn"
    ></app-generic-master-list>
  `
})
export class VisaCategoryListComponent {
  loadFn = () => this.settingsService.getVisaCategories();
  saveFn = (data: any) => this.settingsService.saveVisaCategory(data);
  deleteFn = (id: number) => this.settingsService.deleteVisaCategory(id);

  constructor(private settingsService: SettingsService) {}
}
