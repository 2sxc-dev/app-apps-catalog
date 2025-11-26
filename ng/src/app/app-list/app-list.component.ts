import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppListItem, AppListItemTag } from "./app-list.interfaces";
import { FilterOptionsService } from "../filter-options/fiter-options.services";
import { AppTypeIds } from "./app-list.enums";
import dayjs from "dayjs";
import { AppListItemComponent } from "./app-list-item/app-list-item.component";
import { AsyncPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-list",
  templateUrl: "./app-list.component.html",
  styleUrls: ["./app-list.component.scss"],
  imports: [MatCardModule, AppListItemComponent, AsyncPipe],
})
export class AppListComponent implements OnInit {
  // Observable to store the main of apps
  public appList: Observable<AppListItem[]> = null;

  constructor(private filterService: FilterOptionsService) {}

  ngOnInit() {
    // Subscribe to the filtered app main observable and apply transformations
    this.appList = this.filterService.appListFiltered.pipe(
      // Categorize apps based on their tags
      map((appList: AppListItem[]) => this.categorize(appList)),
      // Sort apps by type weight and date
      map((appList: AppListItem[]) => this.sortByTypeWeightAndDate(appList))
    );
  }

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
      const hasOld = app.Tags.find((tag) => tag.Id === AppTypeIds.old);
      if (!!hasOld) {
        app.Type = hasOld;
        app.Type.Weight = -1;
        return app;
      }

      // Check if the app has a 'Top' tag
      const hasTop = app.Tags.find((tag) => tag.Id === AppTypeIds.top);
      if (!!hasTop) {
        app.Type = hasTop;
        app.Type.Weight = 200;
        return app;
      }

      // Check if the app has a 'Stable' tag
      const hasStable = app.Tags.find((tag) => tag.Id === AppTypeIds.stable);
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
   *
   * @param apps An array of AppListItem objects to be sorted.
   * @returns The sorted array of apps based on their type weight and last updated date.
   */
  sortByTypeWeightAndDate(apps: AppListItem[]) {
    // Sort the apps first by their weight, which consists of the sum of IsNew and the weight of their tags,
    // then by their last updated date, favoring newer dates.
    return apps.sort((a, b) => {
      // Convert last updated dates of apps into dayjs objects
      const firstAppUpdatedDate = dayjs(a.Updated);
      const secondAppUpdatedDate = dayjs(b.Updated);

      // Check if both apps have valid last updated dates
      const validDatesExist = !!a.Updated && !!b.Updated;

      // Calculate the weight of the dates based on their comparison.
      // If validDatesExist is true, compare the last updated dates of apps a and b
      // and assign a weight to the comparison result. If validDatesExist is false,
      // set a default weight of -1 to indicate that the dates are not valid.
      const dateWeight = validDatesExist
        ? +secondAppUpdatedDate.isAfter(firstAppUpdatedDate) ||
          +secondAppUpdatedDate.isSame(firstAppUpdatedDate) - 1
        : -1;

      // Calculate the weight of each app based on its properties and the date weight.
      // The weight consists of the sum of the 'IsNew' property and the 'Weight' property of the app's type.
      // For app 'b', the date weight is also included in the calculation.
      const firstAppWeight = +a.IsNew + a.Type.Weight; // From Tag
      const secondAppWeight =
        +b.IsNew + b.Type.Weight /** From Tag*/ + dateWeight; // Calculate the weight of the second app based on its properties and the date weight;

      // Sort apps in descending order of weight.
      return secondAppWeight - firstAppWeight;
    });
  }
}
