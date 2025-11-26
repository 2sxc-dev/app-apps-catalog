import { effect, Injectable, signal } from "@angular/core";
import {
  AppListItem,
  AppListItemTag,
  AppType,
} from "../app-list/app-list.interfaces";
import { httpResource } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class DataService {
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

  constructor() {
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

      // update signals
      this.appListSig.set(processedApps);
      this.tagListSig.set(allTags);
    });
  }
}
