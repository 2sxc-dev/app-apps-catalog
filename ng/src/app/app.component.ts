import { SxcAppComponent, Context } from '@2sic.com/sxc-angular';
import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends SxcAppComponent {

  constructor(
    el: ElementRef,
    context: Context,
  ) {
    super(el, context);

  }

}
