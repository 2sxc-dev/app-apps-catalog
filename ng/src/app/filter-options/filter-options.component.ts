import { Component, inject, OnInit, computed, effect } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
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
export class FilterOptionsComponent implements OnInit {
  filterService = inject(FilterOptionsService);

  // Define a title prefix for filter labels
  titlePrefix = "Filter by";

  // Observables for filter checkboxes and selects
  public filterCheckboxes$: Observable<FilterCategoryGroup[]> = null;
  public filterSelects$: Observable<FilterCategoryGroup[]> = null;

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

  ngOnInit() {
    // Categories for checkbox filters
    const checkboxCategories = this.checkboxCategories;

    // Filter checkboxes based on specified categories
    this.filterCheckboxes$ = this.filterService.filterGroups.pipe(
      map((groups: FilterCategoryGroup[]) =>
        groups.filter((group) => checkboxCategories.includes(group.Category))
      )
    );

    // Categories for select filters
    const selectCategories = this.selectCategories;
    const tagCategory = this.tagCategory;

    // Filter select filters based on specified categories
    this.filterSelects$ = this.filterService.filterGroups.pipe(
      map((groups: FilterCategoryGroup[]) => {
        const categorySelects = groups.filter((group) =>
          selectCategories.includes(group.Category)
        );

        // Create a 'Tag' category with leftover groups
        const tagSelects = groups
          .filter((group) => !tagCategory.includes(group.Category))
          .reduce(
            (category, group) => {
              // Append options from leftover groups to the 'Tag' category
              category.Options = category.Options.concat(group.Options);
              return category;
            },
            { Category: "Tag", Options: [] } as FilterCategoryGroup
          );

        return categorySelects.concat(tagSelects);
      })
    );
  }
}
