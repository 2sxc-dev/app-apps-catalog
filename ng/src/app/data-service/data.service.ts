import { Injectable } from "@angular/core";
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
        // Collect unique AppType tags
        const appTypeTagsMap = new Map<number, AppListItemTag>();
        Apps.forEach((app) => {
          (app.AppType || []).forEach((appType) => {
            if (!appTypeTagsMap.has(appType.Id)) {
              appTypeTagsMap.set(appType.Id, {
                ...appType,
                Category: "AppType", // Ensure Category is set
              });
            }
          });
        });

        // Merge AppType into Tags array for each app
        const processedApps = Apps.map((app) => ({
          ...app,
          Tags: [...(app.Tags || []), ...(app.AppType || [])],
        }));

        // Combine all tags
        const allTags = [...Tags, ...Array.from(appTypeTagsMap.values())];

        this.appList.next(processedApps);
        this.tagList.next(allTags);
      });
  }
}
