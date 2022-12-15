import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service/data.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  app!: any // interface noch nötig


  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getDetails();
    console.log('detail work')
  }

  getDetails(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.dataService.getDetails(id)
      .subscribe(app => this.app = app);
  }

}
