import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../shared/settings.service';
import { GenericMasterListComponent } from './generic-master-list.component';

@Component({
  standalone: true,
  imports: [CommonModule, GenericMasterListComponent],
  template: `
    <app-generic-master-list
      title="Country Management"
      description="Manage countries for student profiles and program selections."
      itemName="Country"
      idField="country_id"
      [loadFn]="loadFn"
      [saveFn]="saveFn"
      [deleteFn]="deleteFn"
    ></app-generic-master-list>
  `
})
export class CountryListComponent {
  loadFn = () => this.settingsService.getCountries();
  saveFn = (data: any) => this.settingsService.saveCountry(data);
  deleteFn = (id: number) => this.settingsService.deleteCountry(id);

  constructor(private settingsService: SettingsService) {}
}
