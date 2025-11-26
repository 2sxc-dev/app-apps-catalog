import { Component, computed, inject } from "@angular/core";
import { AppListItem, AppListItemTag } from "./app-list.interfaces";
import { FilterOptionsService } from "../filter-options/fiter-options.services";
import { DataService } from "../data-service/data.service";
import { AppTypeIds } from "./app-list.enums";
import dayjs from "dayjs";
import { AppListItemComponent } from "./app-list-item/app-list-item.component";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-list",
  templateUrl: "./app-list.component.html",
  imports: [MatCardModule, MatProgressSpinnerModule, AppListItemComponent],
})
export class AppListComponent {
  filterService = inject(FilterOptionsService);
  dataService = inject(DataService);

  // computed signal that returns the categorized & sorted apps (derived from filtered signal)
  public appList = computed(() => {
    const apps = this.filterService.appListFilteredSig();
    // Clone apps and their tag arrays to avoid mutating service data
    const cloned = (apps || []).map((a) => ({
      ...a,
      Tags: (a.Tags || []).map((t) => ({ ...t })),
      AppType: (a.AppType || []).map((t) => ({ ...t })),
    }));
    const categorized = this.categorize(cloned);
    return this.sortByTypeWeightAndDate(categorized);
  });

  // loading: true while initial data is being fetched (no apps & no tags available yet)
  public loading = computed(() => {
    const apps = this.dataService.appListSig();
    const tags = this.dataService.tagListSig();
    // consider loading when both are empty/undefined — this avoids showing spinner for an empty filtered result
    return (!apps || apps.length === 0) && (!tags || tags.length === 0);
  });

  constructor() {}

  // Function to categorize apps based on their tags
  categorize(apps: AppListItem[]) {
    const emptyType: AppListItemTag = {
      Weight: 0,
      Category: "",
      Id: 0,
      Tag: "",
      Title: "",
    };

    return apps.map((app) => {
      // Determine if the app is new (updated within the last 2 months)
      app.IsNew = dayjs()
        .subtract(2, "month")
        .isBefore(dayjs(app.Updated), "day");

      // Check if the app has an 'Old' tag
      const hasOld = (app.Tags || []).find((tag) => tag.Id === AppTypeIds.old);
      if (!!hasOld) {
        app.Type = hasOld;
        app.Type.Weight = -1;
        return app;
      }

      // Check if the app has a 'Top' tag
      const hasTop = (app.Tags || []).find((tag) => tag.Id === AppTypeIds.top);
      if (!!hasTop) {
        app.Type = hasTop;
        app.Type.Weight = 200;
        return app;
      }

      // Check if the app has a 'Stable' tag
      const hasStable = (app.Tags || []).find(
        (tag) => tag.Id === AppTypeIds.stable
      );
      if (!!hasStable) {
        app.Type = hasStable;
        app.Type.Weight = 100;
        return app;
      }

      // Assign an empty type if no matching tags are found
      app.Type = emptyType;
      return app;
    });
  }

  /**
   * Sorts the given array of apps first by their type weight (considering IsNew and the weight of their tags)
   * and then by their last updated date (Updated), with newer dates being preferred.
   */
  sortByTypeWeightAndDate(apps: AppListItem[]) {
    return apps.sort((a, b) => {
      const firstAppUpdatedDate = dayjs(a.Updated);
      const secondAppUpdatedDate = dayjs(b.Updated);

      const validDatesExist = !!a.Updated && !!b.Updated;

      const dateWeight = validDatesExist
        ? +secondAppUpdatedDate.isAfter(firstAppUpdatedDate) ||
          +secondAppUpdatedDate.isSame(firstAppUpdatedDate) - 1
        : -1;

      const firstAppWeight = +a.IsNew + (a.Type?.Weight ?? 0);
      const secondAppWeight = +b.IsNew + (b.Type?.Weight ?? 0) + dateWeight;

      return secondAppWeight - firstAppWeight;
    });
  }
}
