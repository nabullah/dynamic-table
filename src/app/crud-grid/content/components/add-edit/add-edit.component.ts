import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { IChoice, IEntity, IObjectKeys } from '../../../core/interfaces';
import { ConfigService } from '../../../core/services/config.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ecc-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent<T extends IObjectKeys> implements OnInit {
  @ViewChild('formDirective') private formDirective!: NgForm;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  chipCtrl = new FormControl();
  filteredData!: Observable<IChoice[]>;
  confirmDialog!: MatDialogRef<ConfirmDialogComponent>;

  selectedEntity!: string;

  @ViewChild('chipInput', {static: false}) chipInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete!: MatAutocomplete;

  constructor(
    public configService: ConfigService<T>,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    // https://stackoverflow.com/questions/53483323/angular-2-material-mat-chip-list-formarray-validation
  }

  onFocus(entity: string) {
    this.selectedEntity = entity;
    this.filteredData = this.chipCtrl.valueChanges.pipe(
      startWith(''),
      map((data: string | null) => data ? this._filter(data) : this.configService.modelFieldData[this.selectedEntity].slice())
    );
  }

  onSubmit(): void {
    if (!this.configService.selected) {
      if (this.configService.config.model.formView?.addConfirmationMessage) {
        this.confirmDialog = this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: this.configService.config.model.formView?.addConfirmationMessage
          }
        });
    
        this.confirmDialog.afterClosed().subscribe((yesClicked: boolean) => {
          if (yesClicked) {
            this.createData();
          }
        });
      } else {
        this.createData();
      }
    } else {
      if (this.configService.config.model.formView?.editConfirmationMessage) {
        this.confirmDialog = this.dialog.open(ConfirmDialogComponent, {
          data: {
            message: this.configService.config.model.formView?.editConfirmationMessage
          }
        });
    
        this.confirmDialog.afterClosed().subscribe((yesClicked: boolean) => {
          if (yesClicked) {
            this.updateData();
          }
        });
      } else {
        this.updateData();
      }
    }
  }

  createData() {
    this.configService.createData(()=> {
      this.formDirective.resetForm();
    });
  }

  updateData() {
    this.configService.updateData(()=> {
      this.formDirective.resetForm();
    });
  }

  onCancel(): void {
    this.resetForm();
    if (!this.configService.selected) {
      this.configService.createCancel();
    } else {
      this.configService.updateCancel();
    }
  }

  resetForm(): void {
    this.configService.resetForm();
    this.formDirective.resetForm();
  }

  openFileUpload(fileInput: HTMLInputElement, field: string): void {
    fileInput.onchange = () => {
      // only single file allow to select
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        this.configService.form.get(field)?.setValue(fileInput.files[0]);
        fileInput.value = '';
      }
    };
    fileInput.click();
  }

  onFieldValueChange(event: any, entity: IEntity) {
    if (entity.on_change) {
      this.configService.customActionEvent(entity.on_change, {
        event,
        entity
      });
    }
  }

  addTag(event: MatChipInputEvent, fieldName: string): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = (event.value || '').trim();
      const field = this.configService.form.get(fieldName);
      if (value && !field?.value.includes(value) && this.configService.modelFieldData[fieldName].find((item: IChoice) => item.display_name === value)) {
        field?.value.push(value);
      }
      if (input) {
        input.value = "";
      }
      setTimeout(() => {
        field?.updateValueAndValidity();
      }, 0);
    }
  }

  addCustomTag(event: MatChipInputEvent, fieldName: string, validationFunction: (data: string) => boolean): void {
    const input = event.input;
    const value = (event.value || '').trim();
    const field = this.configService.form.get(fieldName);
    if (value && !field?.value.includes(value) && validationFunction(value)) {
      field?.setValue([...field?.value, value]);
      if (input) {
        input.value = "";
      }
    }
    setTimeout(() => {
      field?.updateValueAndValidity();
    }, 0);  
  }

  removeTag(value: string, fieldName: string): void {
    const index = this.configService.form.get(fieldName)?.value.indexOf(value);

    if (index >= 0) {
      this.configService.form.get(fieldName)?.value.splice(index, 1);
    }
    setTimeout(() => {
      this.configService.form.get(fieldName)?.updateValueAndValidity();
    }, 0);
  }

  selectTag(event: MatAutocompleteSelectedEvent, fieldName: string): void {
    const value = event.option.viewValue;
    const field = this.configService.form.get(fieldName);
    if (value && !field?.value.includes(value)) {
      field?.value.push(value);
    }
    this.chipInput.nativeElement.value = '';
    this.chipCtrl.setValue(null);
    this.chipCtrl.disable();
    this.chipCtrl.enable();
    setTimeout(() => {
      this.configService.form.get(fieldName)?.updateValueAndValidity();
    }, 0);
  }

  private _filter(value: string): IChoice[] {
    const filterValue = value.toLowerCase();
    return this.configService.modelFieldData[this.selectedEntity].filter(
      (data: IChoice) => (<string>data.display_name).toLowerCase().indexOf(filterValue) === 0);
  }

}
