import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { AppTypeIds } from "../app-list.enums";
import { NgClass, NgFor, NgStyle } from "@angular/common";
import { AppListItem } from "../app-list.interfaces";

@Component({
  selector: "app-list-item",
  templateUrl: "./app-list-item.component.html",
  styleUrls: ["./app-list-item.component.scss"],
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
  ],
})
export class AppListItemComponent {
  @ViewChild('tagsContainer') tagsContainer!: ElementRef;
  isExpanded = false;

  public appTypeIds = AppTypeIds;

  @Input() app!: AppListItem;

  ngOnInit() { }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    if (!this.isExpanded)
      this.checkElementHeight();
  }

  checkElementHeight() {
    const element = this.tagsContainer.nativeElement;
    if (element.scrollHeight > 60) {
      element.classList.add('with-gradient');
    } else {
      element.classList.remove('with-gradient');
    }
  }

  isOldApp(app: AppListItem, appTypeId: number): boolean {
    return app.Tags.some(tag => tag.Id === appTypeId);
  }
}
