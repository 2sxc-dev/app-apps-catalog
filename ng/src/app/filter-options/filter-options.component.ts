import { Component, inject, computed } from "@angular/core";
import { FilterCategoryGroup } from "./filter-options.interfaces";
import { FilterOptionsService } from "./fiter-options.services";
import { FilterSelectsComponent } from "./filter-selects/filter-selects.component";
import { FilterCheckboxesComponent } from "./filter-checkboxes/filter-checkboxes.component";
import { MatExpansionModule } from "@angular/material/expansion";

@Component({
  selector: "app-filter-options",
  templateUrl: "./filter-options.component.html",
  styleUrls: ["./filter-options.component.scss"],
  imports: [
    MatExpansionModule,
    FilterCheckboxesComponent,
    FilterSelectsComponent,
  ],
})
export class FilterOptionsComponent {
  filterService = inject(FilterOptionsService);

  // Define a title prefix for filter labels
  titlePrefix = "Filter by";

  // Use computed signals so they update automatically when service signals change
  private checkboxCategories = ["Release-Type"];
  private selectCategories = ["AppType", "Complexity", "Technology"];
  private tagCategory = this.checkboxCategories.concat(this.selectCategories);

  public filterCheckboxesSig = computed<FilterCategoryGroup[]>(() =>
    (this.filterService.filterGroupsSig() || []).filter((group) =>
      this.checkboxCategories.includes(group.Category)
    )
  );

  public filterSelectsSig = computed<FilterCategoryGroup[]>(() => {
    const groups = this.filterService.filterGroupsSig() || [];
    const categorySelects = groups.filter((group) =>
      this.selectCategories.includes(group.Category)
    );

    const tagSelects = groups
      .filter((group) => !this.tagCategory.includes(group.Category))
      .reduce(
        (category, group) => {
          category.Options = category.Options.concat(group.Options);
          return category;
        },
        { Category: "Tag", Options: [] } as FilterCategoryGroup
      );

    return categorySelects.concat(tagSelects);
  });

  constructor() {}
}
