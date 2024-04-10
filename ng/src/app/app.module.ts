import { ContentManagerModule, SxcRootModule } from "@2sic.com/sxc-angular";
import { HttpClientModule } from "@angular/common/http";
import { NgModule, Provider } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

const providers: Provider[] = [];
@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    SxcRootModule,
    ContentManagerModule,

    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers,
  bootstrap: [AppComponent],
})
export class AppModule { }
