import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { IModel, IObjectKeys } from './core/interfaces';
import { ConfigService } from './core/services/config.service';

@Component({
  selector: 'ecc-crud-grid',
  templateUrl: './crud-grid.component.html',
  styleUrls: ['./crud-grid.component.css'],
  providers: [ConfigService]
})
export class CrudGridComponent<T extends IObjectKeys> implements OnInit {
  @Input() model: IModel;
  @Output() customActions = new EventEmitter();
  @ViewChild('eccAddEdit', { static: true }) eccAddEdit!: CrudGridComponent<T>;
  @ViewChild('eccDetail', { static: true }) eccDetail!: CrudGridComponent<T>;
  @ViewChild('eccList', { static: true }) eccList!: CrudGridComponent<T>;
  @ViewChild('eccMulti', {static: true}) eccMulti!: CrudGridComponent<T>;

  constructor(
    public configService: ConfigService<T>
  ) {
    this.model = {};
  }

  ngOnInit(): void {
    this.configService.setCustomActions(this.customActions);
    this.configService.setConfig(this.model);
    this.configService.fetchMeta();
  }

}
