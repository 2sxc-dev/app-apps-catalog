import { Component, effect, inject, signal } from "@angular/core";
import { FilterOptionsComponent } from "../filter-options/filter-options.component";
import { AppListComponent } from "../app-list/app-list.component";
import { FilterOptionsService } from "../filter-options/filter-options.services";
import { FilterCategoryGroup } from "../filter-options/filter-options.interfaces";
import { appTypeUrlSegmentToId } from "../filter-options/app-type-url-map";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
  imports: [FilterOptionsComponent, AppListComponent],
})
export class MainComponent {
  private readonly filterService = inject(FilterOptionsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly requestedAppTypeId = signal<number | null>(null);
  private readonly appliedAppTypeId = signal<number | null>(null);

  constructor() {
    // Read URL once (server already routed you to /en/apps)
    this.requestedAppTypeId.set(this.getAppTypeIdFromUrl());

    // Re-run when filter groups become available
    effect(() => {
      const requestedId = this.requestedAppTypeId();
      if (!requestedId) 
        return;

      // This makes the effect depend on groups -> it will re-run when groups load
      const group = this.getAppTypeGroup();
      if (!group) 
        return;

      const match = group.Options.find((o) => o.Id === requestedId) ?? null;
      if (!match) 
        return;

      if (this.appliedAppTypeId() === requestedId) 
        return;

      // Atomic update (important)
      this.filterService.setSingleSelectFilter(group, match);

      this.appliedAppTypeId.set(requestedId);
    });
  }

  private getAppTypeGroup(): FilterCategoryGroup | null {
    const groups = this.filterService.filterGroupsSig() || [];
    return groups.find((g) => g.Category === "AppType") ?? null;
  }

  private getAppTypeIdFromUrl(): number | null {
    // Example: /en/apps/type/app-extension
    const parts = this.router.url.split("/").filter(Boolean);
    const typeIndex = parts.indexOf("type");
    if (typeIndex === -1)
      return null;

    const segment = parts[typeIndex + 1];
    if (!segment) 
      return null;

    return appTypeUrlSegmentToId[segment] ?? null;
  }
}
