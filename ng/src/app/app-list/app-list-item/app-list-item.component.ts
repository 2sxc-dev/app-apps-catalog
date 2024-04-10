import { Component, Input } from "@angular/core";
import { AppTypeIds } from "../app-list.enums";
import { NgIf, NgClass, NgStyle, NgFor } from "@angular/common";

@Component({
    selector: "app-list-item",
    templateUrl: "./app-list-item.component.html",
    styleUrls: ["./app-list-item.component.scss"],
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        NgStyle,
        NgFor,
    ],
})
export class AppListItemComponent {
  public appTypeIds = AppTypeIds;

  @Input() app: any = null;

  ngOnInit() {}
}
