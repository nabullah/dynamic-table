import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { IEntity, IModel, IObjectKeys } from '../crud-grid/core/interfaces';
import { ConfigService } from '../crud-grid/core/services/config.service';
import { CrudGridComponent } from '../crud-grid/crud-grid.component';
interface FieldMapping {
  id: number;
  field: string;
  label: string;
  col_name: string;
  readonly: boolean;
  is_trainable: boolean;
  field_type: string;
  tab_type: string;
  value_type: string;
  mandatory: boolean;
  attr_type: string;
  options: string[];
  ocr_score: string;
  is_dependent: boolean;
  relative_field: string[];
  python_funcion: string;
  is_visible: boolean;
}
@Component({
  selector: 'app-mapping',
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss'],
  
})
export class MappingComponent implements OnInit {
  @ViewChild('crudGrid', { static: true })
  crudGrid!: CrudGridComponent<FieldMapping>;
  @ViewChild('columnTemplate', { static: true })
  columnTemplate!: TemplateRef<any>;
  constructor(public configService: ConfigService<any>) {}

  order: string[] = [
    'tab_type',
    'field_type',
    'value_type',
    'field',
    'label',
    'display_order',
    'display_colour',
    'is_trainable',
    'readonly',
    'mandatory',
    'ocr_score',
    'is_visible',
    'match_toggle',
    'is_dependent',
    'relative_field',
    'python_funcion',
  ];
  readonly ON_CHANGE_RELATIVE_FIELD = 'relative_field';
  readonly ON_CHANGE_DEPENDENT = 'is_dependent';
  readonly ON_CHANGE_TRAINABLE = 'is_trainable';
  readonly ON_CHANGE_TYPE = 'on_change_type';
  readonly ON_FIELD_TYPE = 'field';
  entities: {
    [entityKey: string]: IEntity;
  } = {
    tab_type: {
      type: 'choice',
      read_only: false,
    },

    field_type: {
      type: 'choice',
      read_only: false,
    },

    value_type: {
      type: 'choice',
      read_only: false,
      on_change: this.ON_CHANGE_TYPE,
    },

    field: {
      type:'string',
      read_only: false,
      max_length: 50,
      on_change: this.ON_FIELD_TYPE,
    },

    label: {
      type:'string',
      max_length: 50,
    },

    display_order: {},

    display_colour: {
      read_only: true,
    },

    is_dependent: {
      type: 'boolean',
      read_only: false,
      on_change: this.ON_CHANGE_DEPENDENT,
    },

    is_trainable: {
      type: 'boolean',
      read_only: true,
      on_change: this.ON_CHANGE_TRAINABLE,
    },

    readonly: {
      type: 'boolean',
      read_only: true,
    },

    ocr_score: {
      type: 'boolean',
      read_only: true,
    },

    relative_field: {
      type: 'string',
      read_only: true,
      on_change: this.ON_CHANGE_RELATIVE_FIELD,
    },

    python_funcion: {
      type: 'choice',
      read_only: true,
    },
  };
  model: IModel = {
    modelName: 'oscar-mapping',
    title: 'Field Mapping',
    pageName: 'Manage Oscar Mappings',
    showList:false,
    showAll: true,
    listView: {
      order: this.order,
      actions: {
        add: true,
        edit: false,
        delete: false,
      },
      globalFilter: this.configService.globalFilter,
      columnFilter: this.configService.columnFilter,
    },
    formView: {
      order: this.order,
      colsWidth: [33.1],
      defaultValue: {
        tab_type: 'Invoice Header',
        field_type: 'FORM',
        value_type: 'extracted',
        is_trainable: true,
        readonly: true,
        ocr_score: true,
        display_colour: 'green',
      },
    },
    entities: this.entities,
  };
  ngOnInit(): void {}
  onCustomActions({
    funcName,
    data,
  }: {
    funcName: string;
    data: { entity: IEntity; event: MatSelectChange | MatCheckboxChange };
  }): void {
    // CHECK FOR FIELD_TYPE EXTRACTED
    if (funcName == this.ON_CHANGE_TYPE) {
      if ((<MatSelectChange>data.event).value === 'extracted') {
        this.crudGrid?.configService?.form.get('is_trainable')!.setValue(true);
        this.crudGrid?.configService?.form.get('readonly')!.setValue(true);
        this.crudGrid?.configService?.form.get('ocr_score')!.setValue(true);
        this.crudGrid?.configService?.form
          .get('display_colour')!
          .setValue('green');
        // this.entities.['is_trainable'].read_only = true;
        // this.entities.['readonly'].read_only = true;
        // this.entities.['ocr_score'].read_only = true;
      } else if ((<MatSelectChange>data.event).value === 'derived') {
        this.crudGrid.configService.form
          .get('display_colour')!
          .setValue('grey');
        this.defaultValues();
      } else {
        this.defaultValues();
      }
    }
    // CHECK FOR IS_TRAINABLE
    else if (funcName == this.ON_CHANGE_TRAINABLE) {
      if ((<MatCheckboxChange>data.event).checked) {
        this.crudGrid.configService.form.get('readonly')!.setValue(true);
        // this.entities.readonly.read_only = true;
      } else {
        this.crudGrid.configService.form.get('readonly')!.setValue(false);
        // this.entities.readonly.read_only = false;
      }
    }
    // CHECK FOR DEPENDENT
    else if (funcName == this.ON_CHANGE_DEPENDENT) {
      if ((<MatCheckboxChange>data.event).checked) {
        // this.entities.relative_field.read_only = false;
        this.crudGrid.configService.form
          .get('relative_field')!
          .setValidators([Validators.required]);
      } else {
        // this.entities.relative_field.read_only = true;
        // this.entities.python_funcion.read_only = true;
        this.crudGrid.configService.form.get('relative_field')!.setValue('');
        this.crudGrid.configService.form.get('python_funcion')!.setValue('');
        this.crudGrid.configService.form
          .get('relative_field')!
          .setValidators([]);
        this.crudGrid.configService.form
          .get('python_funcion')!
          .setValidators([]);
      }
    } else if (funcName == this.ON_CHANGE_RELATIVE_FIELD) {
      if (this.crudGrid.configService.form.get('relative_field')!.value) {
        // this.entities.python_funcion.read_only = false;
        // this.entities.python_funcion.required = true;
        this.crudGrid.configService.form
          .get('python_funcion')!
          .setValidators([Validators.required]);
      } else {
        // this.entities.python_funcion.read_only = true;
        this.crudGrid.configService.form.get('python_funcion')!.setValue('');
        this.crudGrid.configService.form
          .get('python_funcion')!
          .setValidators([]);
      }
    } else if (funcName == this.ON_FIELD_TYPE) {
      this.crudGrid.configService.form
        .get('field')!
        .setValidators([Validators.required, Validators.maxLength(50)]);
    }
    this.updateValidator();
    // update the generic form entities
    this.crudGrid.configService.updateEntities(this.entities);
  }

  // All Default Settings if NOT Extracted in Field Type
  defaultValues() {
    this.crudGrid.configService.form.get('is_trainable')!.setValue(false);
    this.crudGrid.configService.form.get('readonly')!.setValue(false);
    this.crudGrid.configService.form.get('ocr_score')!.setValue(false);
    // this.entities.is_trainable.read_only = false;
    // this.entities.readonly.read_only = false;
    // this.entities.ocr_score.read_only = false;
  }

  //Update Validator
  updateValidator() {
    this.crudGrid.configService.form.get('field')!.updateValueAndValidity();
    this.crudGrid.configService.form
      .get('relative_field')!
      .updateValueAndValidity();
    this.crudGrid.configService.form
      .get('python_funcion')!
      .updateValueAndValidity();
  }
}
