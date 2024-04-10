import { Component, OnInit } from '@angular/core';
import { FilterOptionsComponent } from '../filter-options/filter-options.component';
import { AppListComponent } from '../app-list/app-list.component';

@Component({
    selector: 'list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: true,
    imports: [FilterOptionsComponent, AppListComponent],
})
export class ListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
