import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterCategoryGroup, FilterOption } from '../filter-options.interfaces';
import { FormGroup, FormControl } from '@angular/forms';
import { FilterOptionsService } from '../fiter-options.services';
import { map } from 'rxjs/operators';
import { CheckboxIds } from '../filter-options.enums';

@Component({
  selector: 'app-filter-checkboxes',
  templateUrl: './filter-checkboxes.component.html',
  styleUrls: ['./filter-checkboxes.component.scss']
})
export class FilterCheckboxesComponent implements OnInit {

  @Input() titlePrefix: string = null;
  @Input() checkboxGroups: Observable<FilterCategoryGroup[]> = new Observable<FilterCategoryGroup[]>();

  public checkboxForm: FormGroup = new FormGroup({
    all: new FormControl(true),
  });

  constructor(public filterService: FilterOptionsService) {}

  ngOnInit() {

    this.checkboxGroups
      .pipe(
        map((groups: FilterCategoryGroup[]) => groups.map((group: FilterCategoryGroup) => {
          const checkboxOrderIds = [
            CheckboxIds.stabel,
            CheckboxIds.template,
            CheckboxIds.tutorial,
            CheckboxIds.featueDemo,
            CheckboxIds.old,
          ];

          const orderedOptions = checkboxOrderIds.map( (id: number) => group.Options.find((option: FilterOption) => option.Id === id) );
          group.Options = orderedOptions;
          return group;
        })),
        map((groups: FilterCategoryGroup[]) => groups.map((group: FilterCategoryGroup) => {
          group.Options.map( (option: FilterOption) => {
            if (option.Id === CheckboxIds.old) {
              option.Tag = 'Hide all old Apps';
            }

            if (option.Id === CheckboxIds.stabel) {
              option.Tooltip = option.Title;
              option.Tag = 'Stable';
            }

            if (option.Id === CheckboxIds.template) {
              option.Tooltip = option.Title;
              option.Tag = 'Template';
            }

            return option;
          });
          return group;
        })),
      )
      .subscribe((groups: FilterCategoryGroup[]) => {
      groups.forEach((group: FilterCategoryGroup) => group.Options.forEach(
        (option: FilterOption) => {
          this.checkboxForm.addControl(option.Title, new FormControl(!option.ShowApps));
      }));
    });
  }

  public areSomeCheckboxesSelected() {
    return Object.keys(this.checkboxForm.controls)
      .filter(key => !['all', 'old'].includes(key) )
      .some(key => this.checkboxForm.get(key).value);
  }

  public showAll() {
    Object.keys(this.checkboxForm.controls)
      .filter(key => !['all', 'old'].includes(key) )
      .forEach(key => {
        const filter = this.filterService.selectedFilters.find(f => f.Title === key);
        this.checkboxForm.get(key).setValue(false);
        if (!!filter) {
          this.toggelCheckbox(filter, false);
        }
      });
  }

  public toggelCheckbox(option: FilterOption, state: boolean) {
    if (state) {
      this.filterService.setFilter(option);
    } else {
      this.filterService.removeFilter(option);
    }
  }
}
