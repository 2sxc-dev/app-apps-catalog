import { Component, input, inject, computed, effect } from "@angular/core";
import {
  FilterCategoryGroup,
  FilterOption,
} from "../filter-options.interfaces";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FilterOptionsService } from "../filter-options.services";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: "app-filter-selects",
  templateUrl: "./filter-selects.component.html",
  styleUrls: ["./filter-selects.component.scss"],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
})
export class FilterSelectsComponent {
  filterService = inject(FilterOptionsService);

  selectGroups = input.required<FilterCategoryGroup[]>();
  titlePrefix = input<string>("");

  initializedDefaults = new Set<string>();

  constructor() {
    effect(() => {
      const group = this.selectGroups()?.find((g) => g.Category === "AppType");
      
      if (!group || this.initializedDefaults.has("AppType"))
        return;
      
      this.filterService.setFilter(group.Options[0]);
      this.initializedDefaults.add("AppType");
    });
  }

  // Computed signal to get the currently selected option for each group
  selectedOptions = computed(() => {
    const groups = this.selectGroups();
    const currentFilters = this.filterService.selectedFilters();

    const selections: Record<string, FilterOption | null> = {};

    groups.forEach((group) => {
      const selectedInGroup = currentFilters.find((filter) =>
        group.Options.some((opt) => opt.Id === filter.Id)
      );
      selections[group.Category] = selectedInGroup || null;
    });

    return selections;
  });

  // Handle select changes
  onSelectionChange(
    group: FilterCategoryGroup,
    selectedOption: FilterOption | null
  ) {
    // Remove all options from this group
    group.Options.forEach((option) => this.filterService.removeFilter(option));

    // Add the selected option if any
    if (selectedOption) {
      this.filterService.setFilter(selectedOption);
    }
  }

  // Get selected value for a specific group
  getSelectedValue(category: string): FilterOption | null {
    return this.selectedOptions()[category] || null;
  }

  compareOptions(option1: FilterOption, option2: FilterOption): boolean {
    return option1 && option2 ? option1.Id === option2.Id : option1 === option2;
  }
}
