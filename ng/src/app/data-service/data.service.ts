import { Injectable, OnInit } from "@angular/core";
import { SxcApp } from "@2sic.com/sxc-angular";

import { shareReplay, Subject } from "rxjs";
import { AppListItem, AppListItemTag } from "../app-list/app-list.interfaces";

@Injectable({ providedIn: "root" })
export class DataService {
  // to learn: discuss how to do this without subjects
  public appList: Subject<AppListItem[]> = new Subject<AppListItem[]>();
  public tagList: Subject<AppListItemTag[]> = new Subject<AppListItemTag[]>();

  constructor(private dnnData: SxcApp) {
    this.loadAppsAndTags();
  }


  private loadAppsAndTags(): void {
    this.dnnData
      .query<{ Apps: AppListItem[]; Tags: Array<AppListItemTag> }>(
        "AppCatalogList"
      )
      .getAll()
      .pipe(shareReplay(1))
      .subscribe(({ Apps, Tags }) => {
        // const filteredApps = Apps.filter(app => app.Name.toLowerCase().includes('hotspots'));
        // console.log("filteredApps:", filteredApps);
        this.appList.next(Apps);
        this.tagList.next(Tags);
      });
  }

  // TODO:: Not In Use, Details view is a Razor Page
  // getDetails(id: number): Observable<any> {
  //   return this.dnnData.query<any>(`AppWithReleases?id=${id}`).getAll();
  // }
}
