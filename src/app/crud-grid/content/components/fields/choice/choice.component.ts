import { Component, Input, OnInit } from '@angular/core';

import { IObjectKeys } from '../../../../core/interfaces';
import { ConfigService } from '../../../../core/services/config.service';

@Component({
  selector: 'ecc-field-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.css']
})
export class ChoiceComponent<T extends IObjectKeys> implements OnInit {
  @Input() entity!: string;

  constructor(public configService: ConfigService<T>) { }

  ngOnInit(): void {
  }

}
