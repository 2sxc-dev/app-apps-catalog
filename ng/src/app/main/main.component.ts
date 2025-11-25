import { Component } from "@angular/core";
import { FilterOptionsComponent } from "../filter-options/filter-options.component";
import { AppListComponent } from "../app-list/app-list.component";

@Component({
  selector: "main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
  imports: [FilterOptionsComponent, AppListComponent],
})
export class MainComponent {}
