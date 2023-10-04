import { Component, OnInit } from "@angular/core";
import { DataService } from "../data-service/data.service";
import { ActivatedRoute } from "@angular/router";
import {  map, Observable, tap } from "rxjs";

@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.scss"],
})
export class DetailsComponent implements OnInit {
  app$!: Observable<any>;
  releases$!: Observable<any>;
  latestVersion: any;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const id = Number(this.route.snapshot.paramMap.get("id"));

    this.app$ = this.dataService
      .getDetails(id)
      .pipe(map((apps) => apps.App[0]));

    this.releases$ = this.dataService.getDetails(id).pipe(
      map((apps) => apps.Releases),
      tap((releases) => (this.latestVersion = Object.values(releases).pop()))
    );
  }
}
