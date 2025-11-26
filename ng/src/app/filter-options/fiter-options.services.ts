import { effect, Injectable, signal } from "@angular/core";
import { DataService } from "../data-service/data.service";
import { FilterCategoryGroup, FilterOption } from "./filter-options.interfaces";
import { CheckboxIds } from "./filter-options.enums";
import { AppListItem, AppListItemTag } from "../app-list/app-list.interfaces";

@Injectable({ providedIn: "root" })
export class FilterOptionsService {
  // Array to store selected filters
  public selectedFilters: FilterOption[] = [];

  // Array to store tag list
  private tagList: AppListItemTag[] = [];

  // Signal for filter groups
  public filterGroupsSig = signal<FilterCategoryGroup[]>([]);

  // Array to store the list of apps
  private appList: AppListItem[] = [];

  // Signal for filtered app list
  public appListFilteredSig = signal<AppListItem[]>([]);

  // flag to only run selectOnInit once
  private _initialized = false;

  constructor(private dataService: DataService) {
    // Initial selection of filters
    const selectOnInit = [CheckboxIds.old];

    // React to app list signal changes
    effect(() => {
      const appList = this.dataService.appListSig();
      if (!appList) return;
      this.appList = appList;
      this.filterAppList(appList);
    });

    // React to tag list signal changes
    effect(() => {
      const tagList = this.dataService.tagListSig();
      if (!tagList) return;

      this.tagList = tagList;

      // Create filter groups and set initial filters
      const groups = this.createFilterGroups(tagList, this.appList);
      this.filterGroupsSig.set(groups);

      if (!this._initialized) {
        this._initialized = true;
        selectOnInit.forEach((selectId) => {
          const select = this.tagList.find((tag) => tag.Id === selectId);
          if (!select) return;
          const option = this.createFilterOption(select);
          this.setFilter(option);
        });
      }
    });
  }

  // Function to filter the app list based on selected filters
  public filterAppList(appList: AppListItem[] = this.appList) {
    // Helper functions to check if an app has certain filters
    const appHasFilter = (app: AppListItem, filter: FilterOption) => {
      // Check both Tags and AppType arrays for matching tag Id
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

    // Function to filter apps based on selected filters
    const filterApps = (apps: AppListItem[]) => {
      // If only filters with ShowApps=false are selected, show the unselected apps
      const showUnselected = this.selectedFilters.every(
        (filter) => !filter.ShowApps
      );

      if (showUnselected) {
        return apps.filter(
          (app) => !appHasSomeFilters(app, this.selectedFilters)
        );
      } else {
        const { showFilters, hideFilters, checkboxFilters } = splitFilters(
          this.selectedFilters
        );

        const onlyShowApps = apps.filter(
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
    };

    // Apply filters to the app list and emit the filtered app list and filter groups
    const filteredApps =
      this.selectedFilters.length > 0 ? filterApps(appList) : appList;
    const filteredTags =
      filteredApps.length > 0
        ? this.createFilterGroups(this.tagList, filteredApps)
        : this.createFilterGroups(this.tagList, this.appList);

    this.filterGroupsSig.set(filteredTags);
    this.appListFilteredSig.set(filteredApps);
  }

  // Function to create filter groups based on tag list and app list
  private createFilterGroups(
    tagList: Array<AppListItemTag>,
    appList: AppListItem[]
  ): FilterCategoryGroup[] {
    const options = tagList.map((tag: AppListItemTag) => {
      const disabled = !appList.some(
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
    const isAlreadyFiltered = this.selectedFilters.some(
      (selected) => selected.Id === filter.Id
    );

    if (!isAlreadyFiltered) {
      this.selectedFilters.push(filter);
      this.filterAppList();
    }
  }

  // Function to remove a filter
  public removeFilter(filter: FilterOption) {
    const index = this.selectedFilters.findIndex(
      (selected) => selected.Id === filter.Id
    );

    if (index > -1) {
      this.selectedFilters.splice(index, 1);
      this.filterAppList();
    }
  }
}
