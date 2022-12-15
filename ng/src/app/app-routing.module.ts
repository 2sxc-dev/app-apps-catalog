import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListComponent } from './app-list/app-list.component';
import { DetailsComponent } from './details/details.component';

const routes: Routes = [
  { path: '', component: AppListComponent },
  { path: 'details/:id', component: DetailsComponent },
// /:id = dynamischer link app-catalog/details/ .....
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
