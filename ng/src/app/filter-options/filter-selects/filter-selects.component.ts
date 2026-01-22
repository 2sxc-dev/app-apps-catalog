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
import { ActivatedRoute, Router } from "@angular/router";
import { appTypeIdToUrlSegment } from "../app-type-url-map";

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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  filterService = inject(FilterOptionsService);

  selectGroups = input.required<FilterCategoryGroup[]>();
  titlePrefix = input<string>("");

  initializedDefaults = new Set<string>();

  constructor() {
  effect(() => {
    const group = this.selectGroups()?.find((g) => g.Category === "AppType");
    if (!group || this.initializedDefaults.has("AppType")) return;

    // If URL already has /type/<something>, do not set a default
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.includes("type")) {
      this.initializedDefaults.add("AppType");
      return;
    }

    this.filterService.setSingleSelectFilter(group, group.Options[0]);
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
  onSelectionChange(group: FilterCategoryGroup, selectedOption: FilterOption | null): void {
    // Apply the selection
    this.filterService.setSingleSelectFilter(group, selectedOption);

    if (group.Category !== "AppType") return;

    // Show all -> reset URL
    if (!selectedOption) {
      window.history.pushState({}, "", "/en/apps");
      return;
    }

    // Use the ID->segment mapping 
    const urlSegment = appTypeIdToUrlSegment[selectedOption.Id];
    if (!urlSegment) 
      return;

    window.history.pushState({}, "", `/en/apps/type/${urlSegment}`);
  }

  // Get selected value for a specific group
  getSelectedValue(category: string): FilterOption | null {
    return this.selectedOptions()[category] || null;
  }

  compareOptions(option1: FilterOption, option2: FilterOption): boolean {
    return option1 && option2 ? option1.Id === option2.Id : option1 === option2;
  }
}
