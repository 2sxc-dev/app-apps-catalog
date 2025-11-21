import { Injectable } from "@angular/core";
import { SxcApp } from "@2sic.com/sxc-angular";

import { combineLatest, shareReplay, Subject } from "rxjs";
import {
  AppListItem,
  AppListItemTag,
  AppType,
} from "../app-list/app-list.interfaces";

@Injectable({ providedIn: "root" })
export class DataService {
  public appList: Subject<AppListItem[]> = new Subject<AppListItem[]>();
  public tagList: Subject<AppListItemTag[]> = new Subject<AppListItemTag[]>();

  constructor(private dnnData: SxcApp) {
    this.loadAppsAndTags();
  }

  private loadAppsAndTags(): void {
    combineLatest([
      this.dnnData
        .query<{ Apps: AppListItem[]; Tags: AppListItemTag[] }>(
          "AppCatalogList"
        )
        .getAll()
        .pipe(shareReplay(1)),

      this.dnnData
        .query<{ Apps: AppType[] }>("AppTypes")
        .getAll()
        .pipe(shareReplay(1)),
    ]).subscribe(([{ Apps, Tags }, typesResult]) => {
      const typeList = typesResult?.Apps ?? [];
      const typeMap = new Map(typeList.map((t) => [String(t.Id), t]));

      const processedApps = (Apps || []).map((app) => {
        const enrichedTypes = (app.AppType || []).map((at) => ({
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
        (a.AppType || []).forEach((t) => {
          const key = String(t.Id);
          if (!typeTagMap.has(key)) {
            typeTagMap.set(key, {
              ...t,
              Category: "AppType",
            } as AppListItemTag);
          }
        })
      );

      const allTags: AppListItemTag[] = [
        ...(Tags || []),
        ...Array.from(typeTagMap.values()),
      ];

      this.appList.next(processedApps);
      this.tagList.next(allTags);
    });
  }
}
