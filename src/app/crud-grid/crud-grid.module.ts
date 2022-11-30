import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CrudGridComponent } from './crud-grid.component';
import { ListComponent } from './content/components/list/list.component';
import { AddEditComponent } from './content/components/add-edit/add-edit.component';
import { DetailComponent } from './content/components/detail/detail.component';
import { MaterialModule } from './content/material/material.module';
import { ConfirmDialogComponent } from './content/components/confirm-dialog/confirm-dialog.component';
import { FilterFieldComponent } from './content/components/filter-field/filter-field.component';
import { CustomActionsComponent } from './content/components/custom-actions/custom-actions.component';
import { EscapeHtmlPipe } from './core/pipes/keep-html.pipe';
import { ChoiceComponent } from './content/components/fields/choice/choice.component';
import { ProvideMatFormFieldReadonlyDirective } from './core/directives/readonly';
import { MultiComponent } from './content/components/multi/multi.component';
import { FlexLayoutModule } from '@angular/flex-layout';


const ALL_COMPONENTS = [
  ListComponent,
  AddEditComponent,
  DetailComponent,
  MultiComponent,
  ConfirmDialogComponent,
  FilterFieldComponent,
  CustomActionsComponent,
  ChoiceComponent
];

const ALL_PIPES = [
  EscapeHtmlPipe
];

const ALL_DIRECTIVES = [
  ProvideMatFormFieldReadonlyDirective
];

@NgModule({
  declarations: [
    CrudGridComponent,
    ALL_COMPONENTS,
    ALL_PIPES,
    ALL_DIRECTIVES
  ],
  exports: [
    CrudGridComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    FlexLayoutModule,
  ]
})
export class CrudGridModule { }
