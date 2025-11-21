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
        // fetch types and merge only the matching type object into each app.AppType
        this.dnnData
          .query<any>("AppTypes")
          .getAll()
          .pipe(shareReplay(1))
          .subscribe((typesResult) => {
            const typeList: any[] = (typesResult && typesResult.Apps) || [];
            const typeMap = new Map(typeList.map((t) => [String(t.Id), t]));

            const processedApps = (Apps || []).map((app) => {
              const enrichedTypes = (app.AppType || []).map((at: any) => ({
                ...(typeMap.get(String(at.Id)) || {}),
                ...at,
              }));

              return {
                ...app,
                AppType: enrichedTypes,
                Tags: [...(app.Tags || []), ...enrichedTypes],
              } as AppListItem;
            });

            const typeTagMap = new Map<string, AppListItemTag>();
            processedApps.forEach((a) =>
              (a.AppType || []).forEach((t: any) => {
                const key = String(t.Id);
                if (!typeTagMap.has(key))
                  typeTagMap.set(key, {
                    ...t,
                    Category: "AppType",
                  } as AppListItemTag);
              })
            );

            const allTags: AppListItemTag[] = [
              ...(Tags || []),
              ...Array.from(typeTagMap.values()),
            ];

            // emit asynchronously to avoid change-detection hiccups
            Promise.resolve().then(() => {
              this.appList.next(processedApps);
              this.tagList.next(allTags);
            });
          });
      });
  }
}
