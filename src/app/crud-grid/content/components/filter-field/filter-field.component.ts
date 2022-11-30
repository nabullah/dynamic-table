import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FilterMode, IColumnFilterOption } from '../../../core/interfaces';

@Component({
  selector: 'ecc-filter-field',
  templateUrl: './filter-field.component.html',
  styleUrls: ['./filter-field.component.css']
})
export class FilterFieldComponent implements OnInit {
  @Input() option!: IColumnFilterOption;
  @Output() filterEvent = new EventEmitter();

  filterMatchModes: FilterMode[] = [
    {
      mode: 'starts_with',
      label: 'Starts with'
    },
    {
      mode: 'icontains',
      label: 'Contains'
    },
    {
      mode: 'ends_with',
      label: 'Ends with'
    },
    {
      mode: 'equals',
      label: 'Equals'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    const filterMatchModes = this.option && this.option.modes || [];
    if (filterMatchModes.length > 0) {
      this.filterMatchModes = filterMatchModes;
    }
  }

  onFilter(event: Event): void {
    this.option.value = (event.target as HTMLInputElement).value;
    this.filterEvent.emit();
  }

  onChangeFilterMatchMode(mode: string): void {
    this.option.filterMatchMode = mode;
    this.filterEvent.emit();
  }

  clearFilter(): void {
    this.option.value = '';
    this.filterEvent.emit();
  }

}
