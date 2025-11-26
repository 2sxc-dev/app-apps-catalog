import { Component, inject, input, effect, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import {
  FilterCategoryGroup,
  FilterOption,
} from "../filter-options.interfaces";
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { FilterOptionsService } from "../fiter-options.services";
import { CheckboxIds } from "../filter-options.enums";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { JsonPipe } from "@angular/common";

@Component({
  selector: "app-filter-checkboxes",
  templateUrl: "./filter-checkboxes.component.html",
  styleUrls: ["./filter-checkboxes.component.scss"],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatTooltipModule,
    JsonPipe,
  ],
})
export class FilterCheckboxesComponent implements OnDestroy {
  filterService = inject(FilterOptionsService);

  checkboxGroupsSig = input.required<FilterCategoryGroup[]>();

  // FormGroup controlling the checkboxes
  public checkboxForm: FormGroup = new FormGroup({});
  private subscription = new Subscription();

  constructor() {
    // Effekt reagiert automatisch auf Änderungen von checkboxGroupsSig
    effect(() => {
      const groups = this.checkboxGroupsSig();
      if (!groups || groups.length === 0) return;

      console.log("Checkbox Groups Signal updated:", groups);

      // Transformationen: Reihenfolge, Tags, Tooltips
      groups.forEach((group: FilterCategoryGroup) => {
        const checkboxOrderIds = [
          CheckboxIds.stabel,
          CheckboxIds.tutorial,
          CheckboxIds.featueDemo,
          CheckboxIds.old,
        ];

        // Sort options
        group.Options = checkboxOrderIds
          .map((id: number) => group.Options.find((opt) => opt.Id === id))
          .filter(Boolean) as FilterOption[];

        // Update tags/tooltips
        group.Options.forEach((option) => {
          if (option.Id === CheckboxIds.old) option.Tag = "Hide all old Apps";
          if (option.Id === CheckboxIds.stabel) {
            option.Tooltip = option.Title;
            option.Tag = "Stable";
          }

          // Add FormControl if it does not exist
          if (!this.checkboxForm.get(option.Title)) {
            const control = new FormControl(!option.ShowApps);
            this.checkboxForm.addControl(option.Title, control);

            this.subscription.add(
              control.valueChanges.subscribe((state: boolean) => {
                if (state) {
                  this.filterService.setFilter(option);
                } else {
                  this.filterService.removeFilter(option);
                }
              })
            );
          }
        });
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
