import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ICustomAction, IObjectKeys } from '../../../core/interfaces';
import { ConfigService } from '../../../core/services/config.service';

@Component({
  selector: 'ecc-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.css']
})
export class CustomActionsComponent<T extends IObjectKeys> implements OnInit {
  @Input() customActions?: ICustomAction[];
  @Input() data?: Observable<T[]> | T[] | T;

  constructor(public configService: ConfigService<T>) { }

  ngOnInit(): void {
  }

  isDisabled(customAction: ICustomAction) {
    if (customAction.permission) {
      return !this.configService.config?.model?.permission?.[customAction.permission];
    }
    return false;
  }

  onCustomActionsEvent(customAction: ICustomAction): void {
    this.configService.customActionEvent(customAction.funcName!, this.data);
  }

}
