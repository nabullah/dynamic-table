import {
  Injectable,
  OnDestroy,
  EventEmitter,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSort } from '@angular/material/sort';

import { Config } from '../../config';
import {
  IModel,
  IMeta,
  IEntity,
  modelName,
  actionId,
  IListResponse,
  IObjectKeys,
  IListView,
  IFormView,
  IDetailView,
  viewKey,
  IChoice,
  IMultiView,
  IColumnFilterOption,
} from '../interfaces';
import {
  MODEL_NAME,
  ID,
  ORDERING,
  LIST_VIEW,
  FORM_VIEW,
  DETAIL_VIEW,
  MULTI_VIEW,
} from '../constants';
import { GenericService } from './generic.service';
import { MessageService } from './message.service';
import { mergeDeep } from '../utility';
// import { AuthStorageService } from 'src/app/core/services/local/auth-storage.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService<T extends IObjectKeys> implements OnDestroy {
  public entities: {
    [entity: string]: IEntity;
  };
  public metaLoading: boolean;
  public metaError: boolean;

  public loading: boolean;
  public error: boolean;
  public submitting: boolean;

  public config: Config = new Config();
  public onConfigUpdated$: BehaviorSubject<Config> = new BehaviorSubject(
    this.config
  );

  public dataSource: Observable<T[]>;
  public updateDataTable: Subject<null>;
  public pageSize!: number;
  public pageSizeOptions!: number[];
  public actionId: string | number;
  public selected!: T | null;

  public form: FormGroup;

  // public multiDataForm: FormArray;
  public multiDataForm: FormArray;

  public listViewColumns: string[];
  public filterColumns: string[];
  public formColsWidth: number[];
  public multiColsWidth: number[];

  public customActions!: EventEmitter<any>;

  public columnTemplates!: {
    [field: string]: TemplateRef<any>;
  };

  modelFieldData: { [field: string]: IChoice[] };

  columnFilterStatus!: boolean;
  elementToScrollToTopOnEdit!: ElementRef;

  constructor(
    private genericService: GenericService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    // private authStorageService: AuthStorageService,
    private localStorageService: LocalStorageService
  ) {
    this.entities = {};
    this.metaLoading = true;
    this.metaError = false;
    this.loading = false;
    this.error = false;
    this.submitting = false;
    this.dataSource = of([]);
    this.updateDataTable = new Subject();
    this.pageSize = 5;
    this.pageSizeOptions = [5, 10, 25, 100];
    this.actionId = ID;
    this.form = this.formBuilder.group({});
    this.multiDataForm = new FormArray<any>([]);
    this.listViewColumns = [];
    this.filterColumns = [];
    this.formColsWidth = [];
    this.multiColsWidth = [];
    this.columnTemplates = {};
    this.modelFieldData = {};
  }

  setColumnTemplates(field: string, template: TemplateRef<any>): void {
    this.columnTemplates[field] = template;
  }

  setCustomActions(customActions: EventEmitter<any>): void {
    this.customActions = customActions;
  }

  customActionEvent(funcName: string, data?: T | T[] | any): void {
    this.customActions.emit({
      funcName,
      data,
    });
  }

  setConfig(model: IModel, deepMerge: boolean = true): void {
    if (deepMerge) {
      model = {
        ...model,
        [LIST_VIEW]: {
          ...this.config.model[LIST_VIEW],
          ...model[LIST_VIEW],
        },
        [FORM_VIEW]: {
          ...this.config.model[FORM_VIEW],
          ...model[FORM_VIEW],
        },
        [DETAIL_VIEW]: {
          ...this.config.model[DETAIL_VIEW],
          ...model[DETAIL_VIEW],
        },
      };
    }
    this.config.model = Object.assign(this.config.model, model);
    this.onConfigUpdated$.next(this.config);
  }

  resetConfig(): void {
    this.config = new Config();
    this.onConfigUpdated$.next(this.config);
  }

  displayAdd(): void {
    this.resetForm();
    this.setConfig(
      {
        showForm: this.config.model.showAll || true,
        showList: this.config.model.showAll || false,
        showDetail: false,
      },
      false
    );
  }

  displayEdit(row: T): void {
    this.selected = row;
    const data = this.config.model[FORM_VIEW]?.beformFillInForm
      ? this.config.model[FORM_VIEW].beformFillInForm(row)
      : row;
    this.form = this.createForm(data);
    this.form.markAsUntouched();
    this.setConfig(
      {
        showForm: this.config.model.showAll || true,
        showList: this.config.model.showAll || false,
        showDetail: false,
      },
      false
    );
    if (this.config.model[FORM_VIEW]?.onChangeEventInEdit) {
      this.entityOnChange();
    }
    if (
      this.elementToScrollToTopOnEdit &&
      this.elementToScrollToTopOnEdit.nativeElement
    ) {
      this.elementToScrollToTopOnEdit.nativeElement.scrollTop = 0;
    }
  }

  setElementToScrollToTopOnEdit(element: ElementRef) {
    this.elementToScrollToTopOnEdit = element;
  }

  entityOnChange() {
    setTimeout(() => {
      for (const [key, entity] of Object.entries(this.entities)) {
        if (entity.on_change) {
          this.customActionEvent(entity.on_change, {
            event: {
              value: this.form.get(key)?.value,
            },
            entity,
          });
        }
      }
    }, 100);
  }

  displayList(): void {
    this.setConfig(
      {
        showForm: this.config.model.showAll || false,
        showList: this.config.model.showAll || true,
        showDetail: false,
      },
      false
    );
  }

  displayDetail(): void {
    this.setConfig(
      {
        showForm: false,
        showList: false,
        showDetail: true,
      },
      false
    );
  }

  createForm(data: T | null): FormGroup {
    const fields: {
      [key: string]: [
        boolean | string | number | null,
        Validators[] | Validators
      ];
    } = {};
    for (const entity of this.config.model.formView?.order || []) {
      fields[entity] = [
        this.processData(
          { ...this.config.model.formView?.defaultValue, ...data },
          entity,
          this.entities[entity]
        ),
        this.getValidators(this.entities[entity]),
      ];
    }
    const id = this.getActionId(this.config.model.formView);
    if (data && data[id]) {
      fields[id] = [data[id] as string | number, Validators.required];
    }
    return this.formBuilder.group(fields);
  }

  createMultiDataForm(data: T[]): FormArray {
    const multiDataForm = new FormArray<any>([]);
    for (const row of data) {
      multiDataForm.push(this.createForm(row));
    }
    return multiDataForm;
  }

  processData(data: any, entityName: string, entityObject: IEntity) {
    const dataKeys = data && Object.keys(data);
    if (dataKeys.length > 0 && dataKeys.includes(entityName)) {
      if (entityObject && entityObject.type === 'model tags') {
        return (data[entityName] && data[entityName].split(',')) || [];
      }
      return data[entityName];
    } else if (entityObject && entityObject.type === 'boolean') {
      return false;
    }
    return entityObject && entityObject.type === 'model tags' ? [] : null;
  }

  resetForm(): void {
    this.selected = null;
    this.form = this.createForm(null);
    this.form.markAsUntouched();
    this.entityOnChange();
  }

  getValidators(entity: IEntity): Validators[] {
    const validator: Validators[] = [];
    if (entity?.max_length) {
      validator.push(Validators.maxLength(entity.max_length));
    }
    if (entity?.required) {
      if (!this.selected) {
        validator.push(Validators.required);
      } else if (!entity?.optional_edit) {
        validator.push(Validators.required);
      }
    }
    return validator;
  }

  isMandatory(formControl: AbstractControl): boolean {
    return (
      !!formControl.enable &&
      !!formControl.validator &&
      !!formControl.validator(formControl)?.['required']
    );
  }

  getOrderField(sort: MatSort): string {
    if (sort.direction !== '' && sort.active) {
      return `${ORDERING[sort.direction]}${sort.active}`;
    }
    return '';
  }

  prepareMultiDataForm() {
    this.loading = true;
    this.fetchMultiData().subscribe({
      next: (data: T[]) => {
        this.loading = false;
        this.multiDataForm = this.createMultiDataForm(data);
        if (this.config.model.multiView?.afterFetchDataActionName) {
          this.customActionEvent(
            this.config.model.multiView.afterFetchDataActionName,
            data
          );
        }
      },
    });
  }

  createData(callback: () => void): void {
    if (this.form.valid) {
      const formData: FormData = new FormData();
      const formValue = this.config.model[FORM_VIEW]?.beforSubmit
        ? this.config.model[FORM_VIEW]?.beforSubmit(this.form.getRawValue())
        : this.form.getRawValue();
      for (const key of Object.keys(formValue)) {
        formData.append(key, formValue[key]);
      }
      this.submitting = true;
      this.genericService
        .create<IModel, modelName, T>(this.config.model, MODEL_NAME, formData)
        .subscribe({
          next: (data: T) => {
            this.submitting = false;
            this.resetForm();
            this.messageService.open(
              `${this.config.model.title} added successfully`,
              'success'
            );
            callback();
            if (this.config.model.formView?.addActionName) {
              this.customActionEvent(
                this.config.model.formView?.addActionName,
                data
              );
            } else {
              this.updateDataTable.next(null);
              this.displayList();
            }
          },
          error: (error) => {
            this.submitting = false;
            this.error = true;
            this.messageService.open(error, 'error');
          },
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  createCancel(): void {
    if (this.config.model.formView?.addCancelActionName) {
      this.customActionEvent(this.config.model.formView?.addCancelActionName);
    } else {
      this.displayList();
    }
  }

  updateData(callback: () => void): void {
    if (this.form.valid) {
      const formData: FormData = new FormData();
      const formValue = this.config.model[FORM_VIEW]?.beforSubmit
        ? this.config.model[FORM_VIEW].beforSubmit(this.form.getRawValue())
        : this.form.getRawValue();
      for (const key of Object.keys(formValue)) {
        formData.append(key, formValue[key]);
      }
      this.submitting = true;
      this.genericService
        .update<IModel, modelName, T, actionId>(
          this.config.model,
          MODEL_NAME,
          formData,
          this.getActionId(this.config.model.formView)
        )
        .subscribe({
          next: (data: T) => {
            this.submitting = false;
            this.resetForm();
            this.messageService.open(
              `${this.config.model.title} updated successfully`,
              'success'
            );
            callback();
            if (this.config.model.formView?.editActionName) {
              this.customActionEvent(
                this.config.model.formView?.editActionName,
                data
              );
            } else {
              this.updateDataTable.next(null);
              this.displayList();
            }
          },
          error: (error) => {
            this.submitting = false;
            this.error = true;
            this.messageService.open(error, 'error');
          },
        });
    } else {
      this.form.markAllAsTouched();
    }
  }

  updateCancel(): void {
    if (this.config.model.formView?.editCancelActionName) {
      this.customActionEvent(this.config.model.formView?.editCancelActionName);
    } else {
      this.displayList();
    }
  }

  updateMultiData(callback?: (data: T[]) => void): void {
    if (this.multiDataForm.valid) {
      const formValue = this.multiDataForm.value;
      this.submitting = true;
      this.genericService
        .patchOnly<IModel, modelName, T[]>(
          this.config.model,
          MODEL_NAME,
          formValue
        )
        .subscribe({
          next: (data: T[]) => {
            this.submitting = false;
            this.messageService.open(
              `${this.config.model.title} updated successfully`,
              'success'
            );
            callback && callback(data);
          },
          error: (error) => {
            this.submitting = false;
            this.error = true;
            this.messageService.open(error, 'error');
          },
        });
    } else {
      this.multiDataForm.markAllAsTouched();
    }
  }

  deleteData(row: T): void {
    this.genericService
      .delete<IModel, modelName, T, actionId>(
        this.config.model,
        MODEL_NAME,
        row,
        this.getActionId(this.config.model.listView)
      )
      .subscribe({
        next: () => {
          this.updateDataTable.next(null);
          this.displayList();
          this.messageService.open(
            `${this.config.model.title} deleted successfully`,
            'success'
          );
        },
        error: (error) => {
          this.error = true;
          this.messageService.open(error, 'error');
        },
      });
  }

  fetchListData(
    limit?: number,
    offset?: number,
    ordering?: string,
    globalFilter?: string | null,
    columnFilters?: { [key: string]: string } | null
  ): Observable<IListResponse<T> | T[]> {
    return this.genericService.readAll<
      IModel,
      modelName,
      IListResponse<T> | T[]
    >(this.config.model, MODEL_NAME, {
      ...((limit !== null && { limit: limit?.toString() }) || {}),
      ...((offset !== null && { offset: offset?.toString() }) || {}),
      ...((ordering !== null && { ordering }) || {}),
      ...((globalFilter && { global_filter: globalFilter }) || {}),
      ...((columnFilters && columnFilters) || {}),
    });
  }

  fetchMultiData(): Observable<T[]> {
    return this.genericService.readAll<IModel, modelName, T[]>(
      this.config.model,
      MODEL_NAME
    );
  }

  fetchMeta(): void {
    if (this.config.model.metaRequest) {
      this.metaLoading = true;
      this.metaError = false;
      this.genericService
        .meta<IModel, modelName, IMeta>(this.config.model, MODEL_NAME)
        .subscribe({
          next: (meta: IMeta) => {
            this.metaLoading = false;
            this.setMeta(meta);
            this.form = this.createForm(null);
          },
          error: (error) => {
            this.metaLoading = false;
            this.metaError = true;
            this.messageService.open(error, 'error');
          },
        });
    } else {
      this.setMeta(null);
      this.form = this.createForm(null);
      this.metaLoading = false;
    }
  }

  fetchModelFieldData(entities: { [entity: string]: IEntity }) {
    for (const [entityName, entityObject] of Object.entries(entities)) {
      if (entityObject.type === 'model choice' && !entityObject.is_depend) {
        this.fetchModelData(entityName, entityObject);
      } else if (entityObject.type === 'model tags') {
        this.fetchModelData(entityName, entityObject);
      }
    }
  }

  fetchModelData(entityName: string, entityObject: IEntity) {
    this.genericService
      .readAll<
        IEntity,
        'model_name',
        {
          [key: string]: string | number | null;
        }[]
      >(entityObject, 'model_name', entityObject.model_params)
      .subscribe({
        next: (
          entityData: {
            // [key: string]: string | number | null
            [key: string]: string | number | null;
          }[]
        ) => {
          this.modelFieldData[entityName] = entityData.map((data: any) => ({
            value:
              entityObject.value_key != undefined
                ? data[entityObject.value_key]
                : '',
            display_name:
              entityObject.display_name_key != undefined
                ? data[entityObject.display_name_key]
                : '',
          }));
        },
      });
  }

  setMeta(meta: IMeta | null): void {
    this.entities = mergeDeep(
      (meta && (meta.actions.POST || meta.actions.PUT || meta.actions.PETCH)) ||
        {},
      this.config.model.entities
    );
    this.fetchModelFieldData(this.entities);
    const order = Object.keys(this.entities)
      .filter((entity: string) => entity !== ID)
      .sort();
    this.setOrder(order, LIST_VIEW, this.config.model.listView);
    this.setOrder(order, FORM_VIEW, this.config.model.formView);
    this.setOrder(order, DETAIL_VIEW, this.config.model.detailView);
    this.setOrder(order, MULTI_VIEW, this.config.model.multiView);
    this.setColumnFilterOptions(
      this.config.model.listView?.columnFilter || false,
      this.config.model.listView?.columnFilterOptions || {},
      this.config.model.listView?.order || []
    );
    this.setCommonProperties(this.config.model);
    this.setListProperties(this.config.model.listView);
    this.setFormProperties(this.config.model.formView);
    this.setMultiProperties(this.config.model.multiView);
    this.getPermission(this.config.model);
  }

  updateEntities(entities: { [key: string]: IEntity }) {
    this.entities = mergeDeep(this.entities, entities);
  }

  updateValidations() {
    for (const entity of this.config.model.formView?.order || []) {
      this.form.get(entity)?.clearValidators();
      this.form
        .get(entity)
        ?.setValidators(
          this.getValidators(this.entities[entity]) as ValidatorFn[]
        );
      this.form.get(entity)?.updateValueAndValidity();
    }
  }

  setOrder(
    order: string[],
    key: viewKey,
    view?: IListView | IFormView | IDetailView
  ): void {
    if ((view?.order || []).length === 0) {
      this.setConfig(
        {
          [key]: {
            order,
          },
        },
        true
      );
    }
  }

  setColumnFilterOptions(
    columnFilter: boolean,
    columnFilterOptions: {
      [field: string]: IColumnFilterOption;
    },
    order: string[]
  ): void {
    if (
      columnFilter &&
      Object.keys(columnFilterOptions).length === 0 &&
      order.length > 0
    ) {
      this.setConfig(
        {
          [LIST_VIEW]: {
            columnFilterOptions: order.reduce(
              (filterOption, field) => ({
                ...filterOption,
                [field]: {
                  type: 'input',
                  label: `Search ${
                    (this.entities[field] && this.entities[field].label) || ''
                  }`,
                  filterMatchMode: 'icontains',
                  value: '',
                },
              }),
              {}
            ),
          },
        },
        true
      );
    }
  }

  setCommonProperties(meta: IModel): void {
    meta.showForm = meta.showAll || meta.showForm;
    meta.showList = meta.showAll || meta.showList;
    meta.listView = {
      ...meta.listView,
      actions: {
        ...meta.listView?.actions,
        add: meta.showAll ? false : meta.listView?.actions?.add,
      },
    };
  }

  setListProperties(listView?: IListView): void {
    let pageSize = listView?.limit || this.pageSize;
    this.localStorageService
      .getLimit(this.config.model.modelName!)
      .subscribe((limit: number) => {
        if (limit) {
          pageSize = limit;
        }
      });
    this.listViewColumns = [
      ...(listView?.order || []),
      ...(((listView?.actions?.edit ||
        listView?.actions?.delete ||
        listView?.actions?.view ||
        listView?.customRowActions?.length) && ['__action']) ||
        []),
    ];
    this.pageSize = pageSize;
    this.pageSizeOptions = listView?.limitOptions || this.pageSizeOptions;
    this.setFilterColumns(listView);
  }

  toggleColumnFilterStatus() {
    this.columnFilterStatus = !this.columnFilterStatus;
  }

  refreshList() {
    this.updateDataTable.next(null);
    if (this.config.model.listView?.refreshActionName) {
      this.customActionEvent(
        this.config.model.listView?.refreshActionName,
        null
      );
    }
  }

  setPageLimit(limit: number): void {
    if (this.config.model.listView?.isPersist) {
      this.localStorageService.setLimit(this.config.model.modelName!, limit);
    }
  }

  setFilterColumns(listView?: IListView): void {
    const filterColumns = [];
    for (const order of listView?.order || []) {
      if (order in (listView?.columnFilterOptions || {})) {
        filterColumns.push(`${order}_filter`);
      } else {
        filterColumns.push('nofilter');
      }
    }
    this.filterColumns = [
      ...filterColumns,
      ...(((listView?.actions?.edit ||
        listView?.actions?.delete ||
        listView?.actions?.view) && ['nofilter']) ||
        []),
    ];
  }

  setFormProperties(formView?: IFormView): void {
    this.formColsWidth = [];
    const colsWidth = formView?.colsWidth || [];
    const fields = formView?.order || [];
    if (colsWidth.length === 0) {
      this.formColsWidth = new Array(fields.length).fill(100);
    } else {
      while (this.formColsWidth.length < fields.length) {
        this.formColsWidth.push(...colsWidth);
      }
    }
  }

  setMultiProperties(multiView?: IMultiView): void {
    this.multiColsWidth = [];
    const colsWidth = multiView?.colsWidth || [];
    const fields = multiView?.order || [];
    if (colsWidth.length === 0) {
      this.multiColsWidth = new Array(fields.length).fill(100 / fields.length);
    } else {
      this.multiColsWidth.push(...colsWidth);
      while (this.multiColsWidth.length < fields.length) {
        this.multiColsWidth.push(0);
      }
    }
  }

  getActionId(view?: IListView | IFormView | IDetailView): actionId {
    return view?.actionId || this.actionId;
  }

  // getPermission(meta: IModel) {
  //   if (meta.pageName) {
  //     this.authStorageService.getCurrentUser().subscribe((data) => {
  //       if (data && data.user.access) {
  //         this.setConfig({
  //           permission: {
  //             approveaccess: false,
  //             createaccess: false,
  //             deleteaccess: false,
  //             editaccess: false,
  //             viewaccess: false,
  //             ...(data.user.access[meta.pageName] || {})
  //           }
  //         });
  //       } else {
  //         this.setConfig({
  //           permission: {
  //             approveaccess: false,
  //             createaccess: false,
  //             deleteaccess: false,
  //             editaccess: false,
  //             viewaccess: false
  //           }
  //         });
  //       }
  //     });
  //   } else {
  //     this.setConfig({
  //       permission: {
  //         approveaccess: true,
  //         createaccess: true,
  //         deleteaccess: true,
  //         editaccess: true,
  //         viewaccess: true
  //       }
  //     });
  //   }
  // }
  getPermission(meta: IModel) {
    if (meta.pageName) {
      // this.authStorageService.getCurrentUser().subscribe((data) => {
      // if (data && data.user.access) {
      this.setConfig({
        permission: {
          approveaccess: true,
          createaccess: true,
          deleteaccess: true,
          editaccess: true,
          viewaccess: true,
          // ...(data.user.access[meta.pageName] || {})
          ...{},
        },
      });
    }
  }
  ngOnDestroy(): void {
    console.log('Service is destroyed');
  }
}
