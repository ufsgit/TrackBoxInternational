import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { GenericMasterListComponent } from './generic-master-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, GenericMasterListComponent],
  template: `
    <app-generic-master-list
      title="Migration Categories"
      description="Manage categories for the Migration program (e.g. Express Entry, PNP)."
      itemName="Migration Category"
      idField="migration_cat_id"
      [loadFn]="loadFn"
      [saveFn]="saveFn"
      [deleteFn]="deleteFn"
    ></app-generic-master-list>
  `
})
export class MigrationCategoryListComponent {
  loadFn = () => this.settingsService.getMigrationCategories();
  saveFn = (data: any) => this.settingsService.saveMigrationCategory(data);
  deleteFn = (id: number) => this.settingsService.deleteMigrationCategory(id);

  constructor(private settingsService: SettingsService) {}
}
