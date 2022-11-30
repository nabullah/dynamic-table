import { Component, OnInit } from '@angular/core';
import { IObjectKeys } from '../../../core/interfaces';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'ecc-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent<T extends IObjectKeys> implements OnInit {

  constructor(public configService: ConfigService<T>) { }

  ngOnInit(): void {
  }

}
