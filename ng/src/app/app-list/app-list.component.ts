import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AppListItem, AppListItemTag } from "./app-list.interfaces";
import { FilterOptionsService } from "../filter-options/fiter-options.services";
import { AppTypeIds } from "./app-list.enums";
import * as moment from "moment";
import { AppListItemComponent } from "./app-list-item/app-list-item.component";
import { NgClass, AsyncPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";

@Component({
    selector: "app-list",
    templateUrl: "./app-list.component.html",
    styleUrls: ["./app-list.component.scss"],
    standalone: true,
    imports: [
    MatCardModule,
    AppListItemComponent,
    NgClass,
    AsyncPipe
],
})
export class AppListComponent implements OnInit {
  // Observable to store the list of apps
public appList: Observable<AppListItem[]> = null;

constructor(private filterService: FilterOptionsService) {}

ngOnInit() {
  // Subscribe to the filtered app list observable and apply transformations
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
    app.IsNew = moment()
      .subtract(2, "months")
      .isSameOrBefore(moment(app.Updated), "day");

      console.log("IsNew",app.IsNew);

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

    // Check if the app has an 'Old' tag
    const hasOld = app.Tags.find((tag) => tag.Id === AppTypeIds.old);
    if (!!hasOld) {
      app.Type = hasOld;
      app.Type.Weight = -1;
      return app;
    }

    // Assign an empty type if no matching tags are found
    app.Type = emptyType;
    return app;
  });
}

// Function to sort apps by type weight and date
sortByTypeWeightAndDate(apps: AppListItem[]) {
  return apps.sort((a, b) => {
    const aDate = moment(a.Updated);
    const bDate = moment(b.Updated);
    const validDates = !!a.Updated && !!b.Updated;

    // Determine the weight of the dates
    const dateWeight = validDates
      ? +bDate.isAfter(aDate) || +bDate.isSame(aDate) - 1
      : -1;

    // Calculate the weight of each app
    const aWeight = +a.IsNew + a.Type.Weight;
    const bWeight = +b.IsNew + b.Type.Weight + dateWeight;

    // Sort apps in descending order of weight
    return bWeight - aWeight;
  });
}
}
