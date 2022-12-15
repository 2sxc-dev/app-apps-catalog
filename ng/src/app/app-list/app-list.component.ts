import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppListItem, AppListItemTag } from './app-list.interfaces';
import { FilterOptionsService } from '../filter-options/fiter-options.services';
import { AppTypeIds } from './app-list.enums';
import * as moment from 'moment';

@Component({
  selector: 'app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent implements OnInit {

  public appList: Observable<AppListItem[]> = null;

  constructor(private filterService: FilterOptionsService) { }

  ngOnInit() {
    this.appList = this.filterService.appListFiltered
      .pipe(
        map((appList: AppListItem[]) => categorize(appList)),
        map((appList: AppListItem[]) => sortByTypeWeightAndDate(appList)),
      );
  }



}

function categorize(apps: AppListItem[]) {
  const emptyType: AppListItemTag = {
    Weight: 0,
    Category: '',
    Id: 0,
    Tag: '',
    Title: ''
  };

  return apps
    .map(app => {
      app.IsNew = moment().subtract(2, 'month').isSameOrBefore(moment(app.Updated), 'day');

      const hasTop = app.Tags.find(tag => tag.Id === AppTypeIds.top);
      if (!!hasTop) {
        app.Type = hasTop;
        app.Type.Weight = 200;
        return app;
      }

      const hasStable = app.Tags.find(tag => tag.Id === AppTypeIds.stable);
      if (!!hasStable) {
        app.Type = hasStable;
        app.Type.Weight = 100;
        return app;
      }

      const hasOld = app.Tags.find(tag => tag.Id === AppTypeIds.old);
      if (!!hasOld) {
        app.Type = hasOld;
        app.Type.Weight = -1;
        return app;
      }

      app.Type = emptyType;
      return app;
    });
}

function sortByTypeWeightAndDate(apps: AppListItem[]) {

  return apps.sort((a, b) => {
    const aDate = moment(a.Updated);
    const bDate = moment(b.Updated);
    const validDates = !!a.Updated && !!b.Updated;
    const dateWeight = validDates ?
      (+(bDate.isAfter(aDate)) || +(bDate.isSame(aDate)) - 1) : -1;

    const aWeight = +(a.IsNew) + a.Type.Weight;
    const bWeight = +(b.IsNew) + b.Type.Weight + dateWeight;

    return bWeight - aWeight;
  });
}
