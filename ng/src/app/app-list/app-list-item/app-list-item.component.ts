import { Component, Input } from "@angular/core";
import { AppTypeIds } from "../app-list.enums";

@Component({
  selector: "app-list-item",
  templateUrl: "./app-list-item.component.html",
  styleUrls: ["./app-list-item.component.scss"],
})
export class AppListItemComponent {
  public appTypeIds = AppTypeIds;

  @Input() app: any = null;

  ngOnInit() {}
}
