import { Component, ElementRef, input, ViewChild } from "@angular/core";
import { AppTypeIds } from "../app-list.enums";
import { NgClass, NgStyle } from "@angular/common";
import { AppListItem } from "../app-list.interfaces";

@Component({
  selector: "app-list-item",
  templateUrl: "./app-list-item.component.html",
  styleUrls: ["./app-list-item.component.scss"],
  imports: [NgClass, NgStyle],
})
export class AppListItemComponent {
  @ViewChild("tagsContainer") tagsContainer!: ElementRef;
  
  isExpanded = false;

  public appTypeIds = AppTypeIds;

  app = input.required<AppListItem>();

  ngOnInit() {}

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded) this.checkElementHeight();
  }

  checkElementHeight() {
    const element = this.tagsContainer.nativeElement;
    if (element.scrollHeight > 60) {
      element.classList.add("with-gradient");
    } else {
      element.classList.remove("with-gradient");
    }
  }
}
