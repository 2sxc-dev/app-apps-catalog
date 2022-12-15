import { Injectable } from '@angular/core';
// import { Data } from '@2sic.com/dnn-sxc-angular';
import { SxcAppComponent, Context, SxcApp } from '@2sic.com/sxc-angular';
import { HttpClient, HttpParams } from '@angular/common/http';


import { shareReplay, Subject } from 'rxjs';
import { AppListItem, AppListItemTag } from '../app-list/app-list.interfaces';


@Injectable({ providedIn: 'root' })

export class DataService {

  // to learn: discuss how to do this without subjects
  public appList: Subject<AppListItem[]> = new Subject<AppListItem[]>();
  public tagList: Subject<AppListItemTag[]> = new Subject<AppListItemTag[]>();

  constructor(
    private http: HttpClient,
    private context: Context,
    private dnnData: SxcApp,
  ) {
    this.loadAppsAndTags();
  }

  private loadAppsAndTags(): void {
    this.dnnData
      .query<{ Apps: AppListItem[], Tags: Array<AppListItemTag> }>('AppCatalogList')
      .getAll().pipe(shareReplay())
      .subscribe(({ Apps, Tags }) => {
        this.appList.next(Apps);
        this.tagList.next(Tags);
      });
  }
}
