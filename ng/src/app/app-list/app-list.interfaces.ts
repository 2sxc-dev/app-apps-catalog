export interface AppListItemTag {
  Id: number;
  Title: string;
  Tag: string;
  Category: string;
  Weight: number;
  Order?: number;
  Teaser?: string;
}

export interface AppListItem {
  Id: number;
  Type: AppListItemTag;
  IsNew: boolean;
  Icon: string;
  Name: string;
  ShortDescription: string;
  Description: string;
  Tags: Array<AppListItemTag>;
  AppType?: Array<AppListItemTag>;
  UrlKey: string;
  Updated: Date;
}

export interface AppType {
  Created: Date;
  Id: number;
  Modified: Date;
  NameId: string;
  Order?: number;
  Teaser?: string;
  Title?: string;
}