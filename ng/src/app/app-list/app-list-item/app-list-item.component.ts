import {
  Component,
  ElementRef,
  input,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
} from "@angular/core";
import { AppTypeIds } from "../app-list.enums";
import { NgClass, NgStyle } from "@angular/common";
import { AppListItem } from "../app-list.interfaces";

@Component({
  selector: "app-list-item",
  templateUrl: "./app-list-item.component.html",
  styleUrls: ["./app-list-item.component.scss"],
  imports: [NgClass, NgStyle],
})
export class AppListItemComponent implements AfterViewInit {
  @ViewChild("tagsContainer") tagsContainer!: ElementRef;

  cdr = inject(ChangeDetectorRef);

  isExpanded = false;

  public appTypeIds = AppTypeIds;

  app = input.required<AppListItem>();

  ngOnInit() {}

  ngAfterViewInit() {
    this.checkElementHeight();
    this.cdr.detectChanges();
  }

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
