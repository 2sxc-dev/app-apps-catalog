import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import {
  FilterCategoryGroup,
  FilterOption,
} from "../filter-options.interfaces";
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FilterOptionsService } from "../fiter-options.services";
import { MatOptionSelectionChange, MatOptionModule } from "@angular/material/core";
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
    AsyncPipe
  ],
})
export class FilterSelectsComponent implements OnInit {
  @Input() titlePrefix: string = null;
  @Input() selectGroups$: Observable<FilterCategoryGroup[]> = null;

  // Define the form to handle selection
  public selectForm: FormGroup = new FormGroup({});

  constructor(private filterService: FilterOptionsService) { }

  ngOnInit() {
    // Subscribe to the selectGroups$ observable to fetch filter categories
    this.selectGroups$.subscribe((groups: FilterCategoryGroup[]) => {
      groups.forEach((group: FilterCategoryGroup) => {
        // Add a form control for each filter category
        this.selectForm.addControl(group.Category, new FormControl(false));
      });
    });
  }

  // Handle filter selection when a MatOption is changed
  handleFilterSelection(event: MatOptionSelectionChange) {
    if (event.source.selected) {
      // Set the filter if the option is selected
      this.filterService.setFilter(event.source.value);
    } else {
      // Remove the filter if the option is deselected
      this.filterService.removeFilter(event.source.value);
    }
  }

  // Check if a filter option is selected
  isSelected(select: FilterOption, option: FilterOption) {
    return option && option.Id === select.Id;
  }
}
