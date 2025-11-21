import { Component, OnInit, Input, OnDestroy } from "@angular/core";
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
import { NgClass, AsyncPipe } from "@angular/common";

@Component({
  selector: "app-filter-selects",
  templateUrl: "./filter-selects.component.html",
  styleUrls: ["./filter-selects.component.scss"],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    AsyncPipe,
  ],
})
export class FilterSelectsComponent implements OnInit, OnDestroy {
  @Input() titlePrefix: string = null;
  @Input() selectGroups$: Observable<FilterCategoryGroup[]> = null;

  public selectForm: FormGroup = new FormGroup({});
  private selectGroups: FilterCategoryGroup[] = [];
  private subscription = new Subscription();

  constructor(private filterService: FilterOptionsService) {}

  ngOnInit() {
    this.subscription.add(
      this.selectGroups$.subscribe((groups: FilterCategoryGroup[]) => {
        this.selectGroups = groups;

        groups.forEach((group: FilterCategoryGroup) => {
          if (!this.selectForm.get(group.Category)) {
            const defaultValue =
              group.Category === "AppType" && group.Options?.length > 1
                ? group.Options[1]
                : null;

            const control = new FormControl(defaultValue);
            this.selectForm.addControl(group.Category, control);

            if (defaultValue) {
              this.filterService.setFilter(defaultValue);
            }

            this.subscription.add(
              control.valueChanges.subscribe(
                (selectedOption: FilterOption | null) => {
                  const currentGroup = this.selectGroups.find(
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
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  compareOptions(option1: FilterOption, option2: FilterOption): boolean {
    return option1 && option2 ? option1.Id === option2.Id : option1 === option2;
  }
}
