import { Injectable } from "@angular/core";
import { DataService } from "../data-service/data.service";
import { FilterCategoryGroup, FilterOption } from "./filter-options.interfaces";
import { Subject } from "rxjs";
import { CheckboxIds } from "./filter-options.enums";
import { AppListItem, AppListItemTag } from "../app-list/app-list.interfaces";

@Injectable({ providedIn: "root" })
export class FilterOptionsService {
  // Array to store selected filters
  public selectedFilters: FilterOption[] = [];

  // Array to store tag list
  private tagList: AppListItemTag[] = [];

  // Subject to emit filter groups
  public filterGroups: Subject<FilterCategoryGroup[]> = new Subject<
    FilterCategoryGroup[]
  >();

  // Array to store the list of apps
  private appList: AppListItem[] = [];

  // Subject to emit filtered app list
  public appListFiltered: Subject<AppListItem[]> = new Subject<AppListItem[]>();

  constructor(private dataService: DataService) {
    // Initial selection of filters
    const selectOnInit = [CheckboxIds.old];

    // Subscribe to the appList and tagList observables
    this.dataService.appList.subscribe((appList: AppListItem[]) => {
      this.appList = appList;
      this.filterAppList(appList);
    });

    this.dataService.tagList.subscribe((tagList: AppListItemTag[]) => {
      this.tagList = tagList;

      // Create filter groups and set initial filters
      const groups = this.createFilterGroups(tagList, this.appList);
      this.filterGroups.next(groups);

      selectOnInit.forEach((selectId) => {
        const select = this.tagList.find((tag) => tag.Id === selectId);
        const option = this.createFilterOption(select);
        this.setFilter(option);
      });
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
        { showFilters: [], hideFilters: [], checkboxFilters: [] }
      );

    // Function to filter apps based on selected filters
    const filterApps = (apps: AppListItem[]) => {
      // If only filters with ShowApps=false are selected, show the unselected apps
      const showUnselected = this.selectedFilters.every(
        (filter) => !filter.ShowApps
      );

      if (showUnselected) {
        const unselectedApps = apps.filter(
          (app) => !appHasSomeFilters(app, this.selectedFilters)
        );
        return unselectedApps;
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
        const selectedApps = checkboxApps.filter((app) =>
          appHasAllFilters(app, showFilters)
        );

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

    this.filterGroups.next(filteredTags);
    this.appListFiltered.next(filteredApps);
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

    // Capitalize the first letter of option titles and sort them alphabetically
    tempGroup.forEach((group) => {
      group.Options = group.Options.map((option) => {
        if (option.Title) {
          option.Title =
            option.Title.charAt(0).toUpperCase() + option.Title.slice(1);
        }
        return option;
      });

      if (group.Category === "AppType") {
        group.Options.sort((a, b) => {
          const orderA = a.Order ?? 999;
          const orderB = b.Order ?? 999;
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
