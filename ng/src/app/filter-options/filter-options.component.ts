import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterCategoryGroup } from './filter-options.interfaces';
import { FilterOptionsService } from './fiter-options.services';

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  styleUrls: ['./filter-options.component.scss']
})
export class FilterOptionsComponent implements OnInit {

  public titlePrefix = 'Filter by';

  public filterCheckboxes: Observable<FilterCategoryGroup[]> = null;
  public filterSelects: Observable<FilterCategoryGroup[]> = null;

  constructor(public filterService: FilterOptionsService) {}

  ngOnInit() {
    const checkboxCategorys = ['Release-Type'];
    this.filterCheckboxes =
      this.filterService.filterGroups
        .pipe(
          map((groups: FilterCategoryGroup[]) => groups.filter(group => checkboxCategorys.includes(group.Category))),
        );

    const selectsCategorys = ['Complexity', 'Technology'];
    const tagCategory = checkboxCategorys.concat(selectsCategorys);
    this.filterSelects =
      this.filterService.filterGroups
        .pipe(map((groups: FilterCategoryGroup[]) => {
          const categorySelects = groups.filter(group => selectsCategorys.includes(group.Category));
          const tagSelects = groups
            .filter(group => !tagCategory.includes(group.Category))
            .reduce((category, group) => {
              // Create a new category 'Tag' with all leftover groups
              category.Options = category.Options.concat(group.Options);
              return category;
            }, {Category: 'Tag', Options: []} as FilterCategoryGroup);

          return categorySelects.concat(tagSelects);
        }));
  }
}
