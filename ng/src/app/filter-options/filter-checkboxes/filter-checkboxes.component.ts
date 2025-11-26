import { Component, inject, input, computed, signal } from "@angular/core";
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
import { FilterOptionsService } from "../filter-options.services";
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
export class FilterCheckboxesComponent {
  filterService = inject(FilterOptionsService);

  checkboxGroups = input.required<FilterCategoryGroup[]>();

  // Computed signal that transforms and processes checkbox groups
  processedGroups = computed(() => {
    const groups = this.checkboxGroups();
    if (!groups || groups.length === 0) return [];

    return groups.map((group) => {
      const checkboxOrderIds = [
        CheckboxIds.stabel,
        CheckboxIds.tutorial,
        CheckboxIds.featueDemo,
        CheckboxIds.old,
      ];

      // Sort options
      const sortedOptions = checkboxOrderIds
        .map((id: number) => group.Options.find((opt) => opt.Id === id))
        .filter(Boolean) as FilterOption[];

      // Update tags/tooltips
      const processedOptions = sortedOptions.map((option) => {
        const updated = { ...option };
        if (option.Id === CheckboxIds.old) updated.Tag = "Hide all old Apps";
        if (option.Id === CheckboxIds.stabel) {
          updated.Tooltip = option.Title;
          updated.Tag = "Stable";
        }
        return updated;
      });

      return {
        ...group,
        Options: processedOptions,
      };
    });
  });

  // Handle checkbox changes
  onCheckboxChange(option: FilterOption, checked: boolean) {
    if (checked) {
      this.filterService.setFilter(option);
    } else {
      this.filterService.removeFilter(option);
    }
  }

  // Check if an option is selected
  isOptionSelected(option: FilterOption): boolean {
    return this.filterService.selectedFilters().some((f) => f.Id === option.Id);
  }

  // Check if some checkboxes are selected
  areSomeCheckboxesSelected(): boolean {
    const groups = this.processedGroups();
    return groups.some((group) =>
      group.Options.some(
        (option) =>
          !["all"].includes(option.Title.toLowerCase()) &&
          this.isOptionSelected(option)
      )
    );
  }

  // Show all checkboxes (uncheck all except "all" and "old")
  showAll() {
    const groups = this.processedGroups();
    groups.forEach((group) => {
      group.Options.forEach((option) => {
        if (!["all"].includes(option.Title.toLowerCase())) {
          this.filterService.removeFilter(option);
        }
      });
    });
  }
}
