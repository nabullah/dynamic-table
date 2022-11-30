import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { IEntity, IObjectKeys } from '../../../core/interfaces';
import { ConfigService } from '../../../core/services/config.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'ecc-multi',
  templateUrl: './multi.component.html',
  styleUrls: ['./multi.component.scss']
})
export class MultiComponent<T extends IObjectKeys> implements OnInit {
  @ViewChild('formDirective') private formDirective!: NgForm;

  confirmDialog!: MatDialogRef<ConfirmDialogComponent>;

  PASSWORD_TEXT = 'password';

  constructor(
    public configService: ConfigService<T>,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  fieldType(entity: string, index: number) {
    if (
      this.configService.config.model.multiView?.passwordTypeFor &&
      this.configService.config.model.multiView?.passwordValueFor && 
      this.configService.config.model.multiView?.passwordTypeFor === entity
    ) {
      const data = this.configService.multiDataForm.getRawValue()[index];
      return data[this.configService.config.model.multiView.passwordValueFor].toLowerCase().includes(this.PASSWORD_TEXT) && this.PASSWORD_TEXT || 'text';
    }
    return this.configService.entities[entity]?.typeOverride || 'text'
  }

  onSubmit(): void {
    if (this.configService.config.model.multiView?.submitActionName) {
      this.configService.customActionEvent(this.configService.config.model.multiView.submitActionName);
    } else {
      if (this.configService.config.model.multiView?.submitConfirmationMessage) {
        this.confirmDialog = this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: this.configService.config.model.multiView.submitConfirmationMessage
          }
        });
    
        this.confirmDialog.afterClosed().subscribe((yesClicked: boolean) => {
          if (yesClicked) {
            this.updateMultiData();
          }
        });
      } else {
        this.updateMultiData();
      }
    }
  }

  updateMultiData() {
    this.configService.updateMultiData();
  }

  onCancel(): void {
    if (this.configService.config.model.multiView?.submitCancelActionName) {
      this.configService.customActionEvent(this.configService.config.model.multiView?.submitCancelActionName);
    } else {
      this.resetForm();
    }
  }

  resetForm(): void {
    // this.formDirective.resetForm();
  }

  onFieldValueChange(event: Event, entity: IEntity) {
    if (entity.on_change) {
      this.configService.customActionEvent(entity.on_change, {
        event,
        entity
      });
    }
  }

}
