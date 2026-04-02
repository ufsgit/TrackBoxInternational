import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { GenericMasterListComponent } from './generic-master-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, GenericMasterListComponent],
  template: `
    <app-generic-master-list
      title="Occupation Management"
      description="Manage occupations for Migration and Work profiles."
      itemName="Occupation"
      idField="occ_id"
      [loadFn]="loadFn"
      [saveFn]="saveFn"
      [deleteFn]="deleteFn"
    ></app-generic-master-list>
  `
})
export class OccupationListComponent {
  loadFn = () => this.settingsService.getOccupations();
  saveFn = (data: any) => this.settingsService.saveOccupation(data);
  deleteFn = (id: number) => this.settingsService.deleteOccupation(id);

  constructor(private settingsService: SettingsService) {}
}
