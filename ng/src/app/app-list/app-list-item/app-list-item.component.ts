import { Component, Input } from "@angular/core";
import { AppTypeIds } from "../app-list.enums";
import { NgClass, NgStyle } from "@angular/common";

@Component({
    selector: "app-list-item",
    templateUrl: "./app-list-item.component.html",
    styleUrls: ["./app-list-item.component.scss"],
    standalone: true,
    imports: [
    NgClass,
    NgStyle
],
})
export class AppListItemComponent {
  public appTypeIds = AppTypeIds;

  @Input() app: any = null;

  ngOnInit() {}
}
