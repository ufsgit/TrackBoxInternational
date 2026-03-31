import { Component, Input, Output, EventEmitter, ElementRef, HostListener, forwardRef, ViewChild, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="searchable-dropdown-container" [class.is-open]="isOpen">
      <div class="selected-box" #trigger (click)="toggleDropdown()">
        <span class="value-text">{{ selectedLabel || placeholder }}</span>
        <span class="chevron">▼</span>
      </div>
      
      <div class="dropdown-panel" *ngIf="isOpen" [ngStyle]="dropdownStyles">
        <div class="search-box-wrapper">
          <input 
            #searchInput
            type="text" 
            class="filter-input" 
            [(ngModel)]="searchQuery" 
            (input)="onFilter()"
            [placeholder]="'Search...'"
            (click)="$event.stopPropagation()"
          >
        </div>
        
        <ul class="option-list">
          <li *ngIf="allowEmpty" class="option-item" (click)="selectOption(null)">
            -- Select --
          </li>
          <li 
            *ngFor="let opt of filteredOptions" 
            class="option-item" 
            [class.active]="opt.value === value"
            (click)="selectOption(opt)"
          >
            {{ opt.label }}
          </li>
          <li *ngIf="filteredOptions.length === 0" class="no-options">
            No matches found
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .searchable-dropdown-container {
      position: relative;
      width: 100%;
      user-select: none;
      font-family: inherit;
    }
    .selected-box {
      padding: 0.65rem 1rem;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-size: 0.9rem;
      min-height: 40px;
      transition: all 0.2s;
    }
    .selected-box:hover {
      border-color: var(--primary);
    }
    .is-open .selected-box {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .value-text {
      color: var(--text-main);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
    }
    .chevron {
      font-size: 0.7rem;
      color: var(--text-muted);
      transition: transform 0.2s;
    }
    .is-open .chevron {
      transform: rotate(180deg);
      color: var(--primary);
    }
    .dropdown-panel {
      position: fixed;
      z-index: 99999;
      background: white;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      animation: dropdownFade 0.15s ease-out;
    }
    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .search-box-wrapper {
        padding: 10px;
        background: #fdfdfd;
        border-bottom: 1px solid var(--border);
    }
    .filter-input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 0.4rem;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .filter-input:focus {
      border-color: var(--primary);
    }
    .option-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-height: 220px;
      overflow-y: auto;
    }
    .option-item {
      padding: 0.7rem 1rem;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.1s;
      border-left: 3px solid transparent;
    }
    .option-item:hover {
      background: #eff6ff;
      border-left-color: var(--primary);
      color: var(--primary);
    }
    .option-item.active {
      background: var(--primary);
      color: white;
      border-left-color: var(--primary-hover);
    }
    .no-options {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-style: italic;
    }
    .option-list::-webkit-scrollbar {
      width: 6px;
    }
    .option-list::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 3px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableDropdownComponent),
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements ControlValueAccessor, OnChanges {
  @Input() options: { label: string, value: any }[] = [];
  @Input() placeholder: string = 'Select...';
  @Input() allowEmpty: boolean = true;

  @ViewChild('trigger') triggerElement!: ElementRef;

  value: any = null;
  searchQuery: string = '';
  filteredOptions: { label: string, value: any }[] = [];
  isOpen: boolean = false;
  selectedLabel: string = '';
  dropdownStyles: any = {};

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnChanges() {
    this.filteredOptions = [...this.options];
    this.updateLabel();
  }

  writeValue(value: any): void {
    this.value = value;
    this.updateLabel();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.updatePosition();
      this.searchQuery = '';
      this.onFilter();
      setTimeout(() => {
          const input = this.elementRef.nativeElement.querySelector('.filter-input');
          if (input) input.focus();
      }, 0);
    }
  }

  updatePosition() {
    const rect = this.triggerElement.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const panelHeight = 300; // Estimated max height
    
    this.dropdownStyles = {
      'left': rect.left + 'px',
      'width': rect.width + 'px'
    };

    if (spaceBelow < panelHeight && rect.top > panelHeight) {
      // Open UP
      this.dropdownStyles.bottom = (window.innerHeight - rect.top + 5) + 'px';
    } else {
      // Open DOWN
      this.dropdownStyles.top = (rect.bottom + 5) + 'px';
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange() {
    if (this.isOpen) {
      this.updatePosition();
    }
  }

  onFilter() {
    if (!this.searchQuery) {
      this.filteredOptions = [...this.options];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredOptions = this.options.filter(o => 
        o.label.toLowerCase().includes(q)
      );
    }
  }

  selectOption(opt: { label: string, value: any } | null) {
    if (opt) {
      this.value = opt.value;
      this.selectedLabel = opt.label;
    } else {
      this.value = null;
      this.selectedLabel = '';
    }
    this.onChange(this.value);
    this.isOpen = false;
  }

  updateLabel() {
    const found = this.options.find(o => o.value === this.value);
    this.selectedLabel = found ? found.label : (this.value ? this.value : '');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
