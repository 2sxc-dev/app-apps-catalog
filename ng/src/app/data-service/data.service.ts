import { computed, Injectable, signal } from "@angular/core";
import {
  AppListItem,
  AppListItemTag,
  AppType,
} from "../app-list/app-list.interfaces";
import { httpResource } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class DataService {
  // HTTP resources
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

  // Computed signals that derive from HTTP resources
  public appListSig = computed<AppListItem[]>(() => {
    const appsResult = this.appsRes.value();
    const typesResult = this.appTypesRes.value();

    if (!appsResult || !typesResult) return [];

    const Apps = appsResult.Apps ?? [];
    const typeList = typesResult.Apps ?? [];

    const typeMap = new Map(typeList.map((t) => [String(t.Id), t]));

    return Apps.map((app) => {
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
  });

  public tagListSig = computed<AppListItemTag[]>(() => {
    const appsResult = this.appsRes.value();
    const processedApps = this.appListSig();

    if (!appsResult) return [];

    const Tags = appsResult.Tags ?? [];

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

    return [...Tags, ...Array.from(typeTagMap.values())];
  });
}
