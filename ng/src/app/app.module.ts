import { ContentManagerModule, SxcRootModule } from '@2sic.com/sxc-angular';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

import { AppListComponent } from './app-list/app-list.component';
import { AppListItemComponent } from './app-list/app-list-item/app-list-item.component';
import { FilterOptionsComponent } from './filter-options/filter-options.component';
// import { DataService } from './data-service/data.service';
import { FilterCheckboxesComponent } from './filter-options/filter-checkboxes/filter-checkboxes.component';
import { FilterSelectsComponent } from './filter-options/filter-selects/filter-selects.component';
// import { FilterOptionsService } from './filter-options/fiter-options.services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { DetailsComponent } from './details/details.component';
import { AppRoutingModule } from './app-routing.module';
import { ListComponent } from './list/list.component';

const providers: Provider[] = [
  // DataService,
  // FilterOptionsService,

];

@NgModule({
  declarations: [
    AppComponent,
    AppListComponent,
    AppListItemComponent,
    FilterOptionsComponent,
    FilterCheckboxesComponent,
    FilterSelectsComponent,
    DetailsComponent,
    ListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
    ContentManagerModule,
    SxcRootModule,
    AppRoutingModule
  ],
  providers,
  bootstrap: [AppComponent]
})
export class AppModule { }
