import { computed, effect, Injectable, signal } from "@angular/core";
import { DataService } from "../data-service/data.service";
import { FilterCategoryGroup, FilterOption } from "./filter-options.interfaces";
import { CheckboxIds } from "./filter-options.enums";
import { AppListItem, AppListItemTag } from "../app-list/app-list.interfaces";

@Injectable({ providedIn: "root" })
export class FilterOptionsService {
  // Writable signal to store selected filters
  public selectedFilters = signal<FilterOption[]>([]);

  constructor(private dataService: DataService) {
    effect(() => {
      const tagList = this.dataService.tagListSig();
      if (!tagList || tagList.length === 0) return;

      const selectOnInit = [CheckboxIds.old];
      const initialFilters: FilterOption[] = [];

      selectOnInit.forEach((selectId) => {
        const select = tagList.find((tag) => tag.Id === selectId);
        if (select) {
          const option = this.createFilterOption(select);
          initialFilters.push(option);
        }
      });

      // Only set once
      if (this.selectedFilters().length === 0 && initialFilters.length > 0) {
        this.selectedFilters.set(initialFilters);
      }
    });
  }

  // Computed signal for filtered app list
  public appListFilteredSig = computed<AppListItem[]>(() => {
    const appList = this.dataService.appListSig();
    const filters = this.selectedFilters();

    if (filters.length === 0) return appList;

    return this.filterAppList(appList, filters);
  });

  // Computed signal for filter groups
  public filterGroupsSig = computed<FilterCategoryGroup[]>(() => {
    const tagList = this.dataService.tagListSig();
    const appList = this.dataService.appListSig();

    // Pass the full app list here. createFilterGroups will internally
    // apply other-category filters when computing disabled status so that
    // "own dropdown" doesn't affect availability detection.
    return this.createFilterGroups(tagList, appList);
  });

  // Function to filter the app list based on selected filters
  private filterAppList(
    appList: AppListItem[],
    filters: FilterOption[]
  ): AppListItem[] {
    // Helper functions to check if an app has certain filters
    const appHasFilter = (app: AppListItem, filter: FilterOption) => {
      const tags = (app.Tags || []).concat(app.AppType || []);
      return tags.some((tag) => filter.Id === tag.Id);
    };

    const appHasSomeFilters = (app: AppListItem, filters: FilterOption[]) =>
      filters.some((filter) => appHasFilter(app, filter));
    const appHasAllFilters = (app: AppListItem, filters: FilterOption[]) =>
      filters.every((filter) => appHasFilter(app, filter));

    // Helper function to split filters into different categories
    const splitFilters = (filters: FilterOption[]) =>
      filters.reduce(
        (obj, filter) => {
          if (
            filter.ShowApps &&
            !Object.values(CheckboxIds).includes(filter.Id)
          ) {
            obj.showFilters.push(filter);
          }
          if (!filter.ShowApps) {
            obj.hideFilters.push(filter);
          }
          if (
            filter.ShowApps &&
            Object.values(CheckboxIds).includes(filter.Id)
          ) {
            obj.checkboxFilters.push(filter);
          }
          return obj;
        },
        {
          showFilters: [] as FilterOption[],
          hideFilters: [] as FilterOption[],
          checkboxFilters: [] as FilterOption[],
        }
      );

    // If only filters with ShowApps=false are selected, show the unselected apps
    const showUnselected = filters.every((filter) => !filter.ShowApps);

    if (showUnselected) {
      return appList.filter((app) => !appHasSomeFilters(app, filters));
    } else {
      const { showFilters, hideFilters, checkboxFilters } =
        splitFilters(filters);

      const onlyShowApps = appList.filter(
        (app) => !appHasSomeFilters(app, hideFilters)
      );
      const checkboxApps =
        checkboxFilters.length > 0
          ? onlyShowApps.filter((app) =>
              appHasSomeFilters(app, checkboxFilters)
            )
          : onlyShowApps;

      // Include apps with no AppType if "Apps" filter is selected
      const hasAppFilter = showFilters.some((f) => f.Id === 69327);

      const selectedApps = checkboxApps.filter((app) => {
        // If "Apps" filter is active and app has empty AppType, check non-AppType filters only
        if (hasAppFilter && (!app.AppType || app.AppType.length === 0)) {
          const nonAppTypeFilters = showFilters.filter(
            (f) => f.Category !== "AppType"
          );
          return (
            nonAppTypeFilters.length === 0 ||
            appHasAllFilters(app, nonAppTypeFilters)
          );
        }

        return appHasAllFilters(app, showFilters);
      });

      return selectedApps;
    }
  }

  // Function to create filter groups based on tag list and app list
  private createFilterGroups(
    tagList: Array<AppListItemTag>,
    appList: AppListItem[]
  ): FilterCategoryGroup[] {
    const currentSelectedFilters = this.selectedFilters();

    const options = tagList.map((tag: AppListItemTag) => {
      // Build the set of filters to consider for availability: exclude filters
      // coming from the same category as the tag (i.e., ignore "own dropdown")
      const effectiveFilters = currentSelectedFilters.filter(
        (f) => f.Category !== tag.Category
      );

      // Compute the apps that would remain when applying the effective filters
      const consideredApps =
        effectiveFilters.length > 0
          ? this.filterAppList(appList, effectiveFilters)
          : appList;

      const disabled = !consideredApps.some(
        (app) =>
          !!(app.Tags || []).find((appTag) => tag.Id === appTag.Id) ||
          !!(app.AppType || []).find((appTag) => tag.Id === appTag.Id)
      );

      return this.createFilterOption(tag, disabled);
    });

    const tempGroup = options.reduce(
      (groups: FilterCategoryGroup[], option: FilterOption) => {
        const ignoreTags = ["Beta"];
        if (ignoreTags.includes(option.Title)) {
          return groups;
        }

        const category = groups.find(
          (group) => group.Category === option.Category
        );

        if (category) {
          category.Options.push(option);
        } else {
          const newGroup = { Category: option.Category, Options: [option] };
          groups.push(newGroup);
        }

        return groups;
      },
      new Array<FilterCategoryGroup>()
    );

    // Capitalize titles, append teaser in parentheses, and sort
    tempGroup.forEach((group) => {
      group.Options = group.Options.map((option) => {
        if (option.Title) {
          const cap =
            option.Title.charAt(0).toUpperCase() + option.Title.slice(1);
          option.Title = option.Teaser ? `${cap} (${option.Teaser})` : cap;
        }
        return option;
      });

      if (group.Category === "AppType") {
        group.Options.sort((a, b) => {
          const orderA = Number(a.Order ?? 999);
          const orderB = Number(b.Order ?? 999);
          return orderA - orderB;
        });
      } else {
        group.Options.sort((a, b) => a.Title.localeCompare(b.Title));
      }
    });

    return tempGroup;
  }

  // Function to create a filter option
  private createFilterOption(tag: AppListItemTag, disabled: boolean = false) {
    const { Id, Tag, Title, Category, Weight, Order, Teaser } = tag;

    let show = true;

    if (Id === CheckboxIds.old) {
      show = false;
      disabled = false;
    }

    return {
      Id,
      Tag,
      Title,
      Category,
      Weight: Weight ?? 0,
      Disabled: disabled,
      ShowApps: show,
      Tooltip: Teaser || Title || "",
      Order,
      Teaser,
    } as FilterOption;
  }

  // Function to set a filter
  public setFilter(filter: FilterOption) {
    const current = this.selectedFilters();
    const isAlreadyFiltered = current.some(
      (selected) => selected.Id === filter.Id
    );

    if (!isAlreadyFiltered) {
      this.selectedFilters.set([...current, filter]);
    }
  }

  // Function to remove a filter
  public removeFilter(filter: FilterOption) {
    const current = this.selectedFilters();
    const filtered = current.filter((selected) => selected.Id !== filter.Id);
    this.selectedFilters.set(filtered);
  }
}
