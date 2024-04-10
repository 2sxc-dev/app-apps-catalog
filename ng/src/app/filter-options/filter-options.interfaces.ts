import { AppListItemTag } from "../app-list/app-list.interfaces";
export interface FilterOption extends AppListItemTag {
  Disabled: boolean;
  Tooltip: string;
  ShowApps: boolean;
}

export interface FilterCategoryGroup {
  Category: string;
  Options: Array<Option>;
}

interface Option {
  Category: string;
  Disabled: boolean;
  Id: number;
  ShowApps: boolean;
  Tag: string;
  Title: string;
  Tooltip: string;
}
