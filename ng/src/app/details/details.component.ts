import { Component, OnInit } from '@angular/core';
import { DataService } from '../data-service/data.service';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  app$!: Observable<any>;
  releases$!: Observable<any>;


  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

  //  this.app$ = this.dataService.getDetails(id).pipe(map(apps =>  apps.App[0]) )



   this.app$ = this.dataService.getDetails(id).pipe(map(apps =>  console.log( apps.Releases) ))

  //  this.releases$ = this.dataService.getDetails(id).pipe(map(apps =>  console.log( apps.Releases) ))





  //  this.app$ = this.dataService.getDetails(id).pipe(map(apps => apps.App[0]) )


  //  this.app$.pipe(map(apps => apps.App[0]) )

  }


}
