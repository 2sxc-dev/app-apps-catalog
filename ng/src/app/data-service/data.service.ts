import { Injectable } from '@angular/core';
import {  Context, SxcApp } from '@2sic.com/sxc-angular';
import { HttpClient} from '@angular/common/http';


import { Observable, of, shareReplay, Subject } from 'rxjs';
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
        // console.log(Tags)
        // console.log(Apps)
        this.appList.next(Apps);
        this.tagList.next(Tags);
      });

  }

  getDetails(id: number):Observable<any> {
    const apps = this.appList['Apps'].find(h => h.Id === id)
    return of(apps);
  }


}
