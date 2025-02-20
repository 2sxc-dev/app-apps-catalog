import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import {
  FilterCategoryGroup,
  FilterOption,
} from "../filter-options.interfaces";
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FilterOptionsService } from "../fiter-options.services";
import { map } from "rxjs/operators";
import { CheckboxIds } from "../filter-options.enums";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AsyncPipe, JsonPipe } from "@angular/common";

@Component({
  selector: "app-filter-checkboxes",
  templateUrl: "./filter-checkboxes.component.html",
  styleUrls: ["./filter-checkboxes.component.scss"],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTooltipModule,
    AsyncPipe,
    JsonPipe
  ],
})
export class FilterCheckboxesComponent implements OnInit {
  @Input() titlePrefix: string = null;
  @Input() checkboxGroups$: Observable<FilterCategoryGroup[]> = new Observable<
    FilterCategoryGroup[]
  >();
  // Definition of the form controlling the checkboxes
  public checkboxForm: FormGroup = new FormGroup({});

  constructor(public filterService: FilterOptionsService) { }

  ngOnInit() {
    // Fetch the checkbox groups and their options
    this.checkboxGroups$
      .pipe(
        // First transformation: Arrange options in the desired order
        map((groups: FilterCategoryGroup[]) =>
          groups.map((group: FilterCategoryGroup) => {
            const checkboxOrderIds = [
              CheckboxIds.stabel,
              CheckboxIds.template,
              CheckboxIds.tutorial,
              CheckboxIds.featueDemo,
              CheckboxIds.old,
            ];
            const orderedOptions = checkboxOrderIds.map((id: number) =>
              group.Options.find((option: FilterOption) => option.Id === id)
            );
            group.Options = orderedOptions;
            return group;
          })
        ),
        // Second transformation: Adjust tags and tooltips of options
        map((groups: FilterCategoryGroup[]) =>
          groups.map((group: FilterCategoryGroup) => {
            group.Options.map((option: FilterOption) => {
              if (option.Id === CheckboxIds.old) {
                option.Tag = "Hide all old Apps";
              }

              if (option.Id === CheckboxIds.stabel) {
                option.Tooltip = option.Title;
                option.Tag = "Stable";
              }

              if (option.Id === CheckboxIds.template) {
                option.Tooltip = option.Title;
                option.Tag = "Template";
              }

              return option;
            });
            return group;
          })
        )
      )
      .subscribe((groups: FilterCategoryGroup[]) => {
        // Add checkboxes to the form

        groups.forEach((group: FilterCategoryGroup) =>
          group.Options.forEach((option: FilterOption) => {
            // Set 'old' checkbox to true
            // const isOldCheckbox = option.Id === CheckboxIds.old;
            this.checkboxForm.addControl(
              option.Title,
              new FormControl(!option.ShowApps)
              // new FormControl(isOldCheckbox ? true : !option.ShowApps) // Setzt 'old' von Anfang an auf true
            );
          })
        );

      });
  }

  // Check if some checkboxes are selected
  public areSomeCheckboxesSelected() {
    return Object.keys(this.checkboxForm.controls)
      .filter((key) => !["all", "old"].includes(key))
      .some((key) => this.checkboxForm.get(key).value);
  }

  // Show all checkboxes
  public showAll() {
    Object.keys(this.checkboxForm.controls)
      .filter((key) => !["all", "old"].includes(key))
      .forEach((key) => {
        const filter = this.filterService.selectedFilters.find(
          (f) => f.Title === key
        );
        this.checkboxForm.get(key).setValue(false);
        if (!!filter) {
          this.toggleCheckbox(filter, false);
        }
      });
  }

  // Toggle checkbox state
  public toggleCheckbox(option: FilterOption, state: boolean) {
    if (state) {
      this.filterService.setFilter(option);
    } else {
      this.filterService.removeFilter(option);
    }
  }
}
