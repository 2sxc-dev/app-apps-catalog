import { effect, Injectable, signal } from "@angular/core";
import { SxcApp } from "@2sic.com/sxc-angular";

import { combineLatest, shareReplay, Subject } from "rxjs";
import {
  AppListItem,
  AppListItemTag,
  AppType,
} from "../app-list/app-list.interfaces";
import { httpResource } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class DataService {
  public appList: Subject<AppListItem[]> = new Subject<AppListItem[]>();
  public tagList: Subject<AppListItemTag[]> = new Subject<AppListItemTag[]>();

  public appListSig = signal<AppListItem[]>([]);
  public tagListSig = signal<AppListItemTag[]>([]);

  private appsRes = httpResource<{
    Apps: AppListItem[];
    Tags: AppListItemTag[];
  }>(() => ({
    url: `https://2sxc.org/api/2sxc/app/auto/query/AppCatalogList`,
    params: {
      PageId: 470,
      ModuleId: 4526,
    },
    method: "GET",
  }));

  private appTypesRes = httpResource<{ Apps: AppType[] }>(() => ({
    url: `https://2sxc.org/api/2sxc/app/auto/query/AppTypes`,
    params: {
      PageId: 470,
      ModuleId: 4526,
    },
    method: "GET",
  }));

  constructor(private dnnData: SxcApp) {
    this.loadAppsAndTags();
    this.loadAppsAndTagsSignal();
  }

  private loadAppsAndTagsSignal() {
    effect(() => {
      const appsResult = this.appsRes.value();
      const typesResult = this.appTypesRes.value();

      if (!appsResult || !typesResult) return;

      const Apps = appsResult.Apps ?? [];
      const Tags = appsResult.Tags ?? [];
      const typeList = typesResult.Apps ?? [];

      const typeMap = new Map(typeList.map((t) => [String(t.Id), t]));

      const processedApps = Apps.map((app) => {
        const enrichedTypes = (app.AppType ?? []).map((at) => ({
          ...(typeMap.get(String(at.Id)) ?? {}),
          ...at,
        }));

        return {
          ...app,
          AppType: enrichedTypes,
          Tags: [...(app.Tags ?? []), ...enrichedTypes],
        };
      });

      // Tags für AppTypes generieren
      const typeTagMap = new Map<string, AppListItemTag>();
      processedApps.forEach((a) =>
        (a.AppType || []).forEach((t) => {
          const key = String(t.Id);
          if (!typeTagMap.has(key)) {
            typeTagMap.set(key, {
              ...t,
              Category: "AppType",
            });
          }
        })
      );

      const allTags: AppListItemTag[] = [
        ...Tags,
        ...Array.from(typeTagMap.values()),
      ];

      // Signals updaten
      this.appListSig.set(processedApps);
      this.tagListSig.set(allTags);
    });
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
