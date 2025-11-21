import { AppListItemTag } from "../app-list/app-list.interfaces";

export interface FilterOption extends AppListItemTag {
  Disabled: boolean;
  Tooltip: string;
  ShowApps: boolean;
}

export interface FilterCategoryGroup {
  Category: string;
  Options: Array<FilterOption>;
}
