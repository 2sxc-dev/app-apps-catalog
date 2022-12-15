import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterCategoryGroup, FilterOption } from '../filter-options.interfaces';
import { FormGroup, FormControl } from '@angular/forms';
import { FilterOptionsService } from '../fiter-options.services';
import { MatOptionSelectionChange } from '@angular/material/core';

@Component({
  selector: 'app-filter-selects',
  templateUrl: './filter-selects.component.html',
  styleUrls: ['./filter-selects.component.scss']
})
export class FilterSelectsComponent implements OnInit {


  @Input() titlePrefix: string = null;
  @Input() selectGroups: Observable<FilterCategoryGroup[]> = null;

  public selectForm: FormGroup = new FormGroup({});

  constructor(private filterService: FilterOptionsService) { }

  ngOnInit() {
    this.selectGroups.subscribe((groups: FilterCategoryGroup[]) => {
      groups.forEach((group: FilterCategoryGroup) => {
        this.selectForm.addControl(group.Category, new FormControl(false));
      });
    });
    // console.log(this.selectForm)
  }

  handleFilterSelection(event: MatOptionSelectionChange) {
    console.log('event', event)
    if (event.source.selected) {
      this.filterService.setFilter(event.source.value);
    } else {
      this.filterService.removeFilter(event.source.value);
    }
  }

  isSelected(select: FilterOption, option: FilterOption) {
    // console.log('select',select)
    // console.log('selected id',select.Id)
    // console.log('option',option)

    return option && option.Id === select.Id;
  }
}
