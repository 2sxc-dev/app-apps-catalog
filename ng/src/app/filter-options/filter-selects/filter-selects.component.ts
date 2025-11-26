import { Component, OnInit, Input, OnDestroy, input, inject, effect } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import {
  FilterCategoryGroup,
  FilterOption,
} from "../filter-options.interfaces";
import {
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { FilterOptionsService } from "../fiter-options.services";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: "app-filter-selects",
  templateUrl: "./filter-selects.component.html",
  styleUrls: ["./filter-selects.component.scss"],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
})
export class FilterSelectsComponent implements OnDestroy {
  filterService = inject(FilterOptionsService);

  // Signal für synchronen Input
  selectGroupsSig = input.required<FilterCategoryGroup[]>();
  titlePrefix = input<string>("");

  public selectForm: FormGroup = new FormGroup({});
  private subscription = new Subscription();

  constructor() {
    // Effekt reagiert automatisch auf Änderungen von selectGroupsSig
    effect(() => {
      const groups = this.selectGroupsSig();

      if (!groups || groups.length === 0) return;

      groups.forEach((group: FilterCategoryGroup) => {
        // Control nur erstellen, wenn es noch nicht existiert
        if (!this.selectForm.get(group.Category)) {
          const defaultValue =
            group.Category === "AppType" && group.Options?.length > 1
              ? group.Options[0]
              : null;

          const control = new FormControl(defaultValue);
          this.selectForm.addControl(group.Category, control);

          if (defaultValue) {
            this.filterService.setFilter(defaultValue);
          }

          this.subscription.add(
            control.valueChanges.subscribe(
              (selectedOption: FilterOption | null) => {
                const currentGroup = groups.find(
                  (g) => g.Category === group.Category
                );
                if (currentGroup) {
                  currentGroup.Options.forEach((option) =>
                    this.filterService.removeFilter(option)
                  );
                  if (selectedOption) {
                    this.filterService.setFilter(selectedOption);
                  }
                }
              }
            )
          );
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  compareOptions(option1: FilterOption, option2: FilterOption): boolean {
    return option1 && option2 ? option1.Id === option2.Id : option1 === option2;
  }
}
