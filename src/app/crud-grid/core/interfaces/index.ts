import { DETAIL_VIEW, FORM_VIEW, LIST_VIEW, MULTI_VIEW } from '../constants';

type methods = 'POST' | 'PETCH' | 'PUT';
type entityType = 'string' | 'number' | 'choice' | 'radio' | 'boolean' | 'file upload' | 'textarea' | 'tags' | 'model choice' | 'model tags' | 'custom tags' | 'password' | 'date' | 'datetime' | 'time';
type entityTypeOverride = 'text' | 'password';
type actionType = 'button' | 'icon';
type permissionType = 'approveaccess' | 'createaccess' | 'deleteaccess' | 'editaccess' | 'viewaccess';

export type viewKey = typeof DETAIL_VIEW | typeof FORM_VIEW | typeof LIST_VIEW | typeof MULTI_VIEW;

export type modelName = 'modelName';
export type actionId = string | number;

export interface IObjectKeys {
  [key: string]: string | boolean | number | undefined | null | any;
}

export interface IParams {
  [param: string]: string | string[];
}

export interface IChoice {
  value: string | number;
  display_name: string | number;
}

export interface IAction {
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
  view?: boolean;
}

export interface IEntity {
  label?: string;
  max_length?: number;
  read_only?: boolean;
  read_only_edit?: boolean;
  required?: boolean;
  optional_edit?: boolean;
  type?: entityType;
  typeOverride?: entityTypeOverride;
  choices?: IChoice[];
  model_name?: string;
  model_params?: IParams;
  value_key?: string;
  display_name_key?: string;
  on_change?: string;
  is_depend?: boolean;
  is_header?: boolean;
  header_side_link?: string[];
  header_side_link_name?: string;
  validationFunction?: (data: string) => boolean;
}

export interface ICustomAction {
  text: string;
  type: actionType;
  tooltip?: boolean;
  icon?: string;
  className?: string;
  color?: string;
  funcName?: string;
  loading?: boolean;
  permission?: permissionType;
}

export interface IFilterOption {
  id: string;
  value: string;
}

export interface IColumnFilterOption {
  type: string;
  label: string;
  filterMatchMode: string;
  options?: IFilterOption[];
  value?: string | number;
  exact_mode?: boolean;
  modes?: FilterMode[];
}

export interface FilterMode {
  mode: string;
  label: string;
}
export interface IListView {
  pagination?: boolean;
  showCountOnly?: boolean;
  limit?: number;
  limitOptions?: number[];
  order?: string[];
  colsWidth?: (string | number)[];
  columnFilterOptions?: {
    [field: string]: IColumnFilterOption
  };
  columnFilter?: boolean;
  globalFilter?: boolean;
  globalFilterLabel?: string;
  actions?: IAction;
  actionId?: string | number;
  afterFetchListActionName?: string;
  customRowActions?: ICustomAction[];
  customActions?: ICustomAction[];
  actionsOnTop?: boolean;
  fixHeader?: boolean;
  isPersist?: boolean;
  refreshButton?: boolean;
  refreshActionName?: string;
}

export interface IFormView {
  customSubtitle?: string;
  order?: string[];
  colsWidth?: number[];
  actionId?: string | number;
  addActionDisabled?: boolean;
  addActionName?: string;
  addButtonName?: string;
  addConfirmationMessage?: string;
  editActionName?: string;
  editButtonName?: string;
  editConfirmationMessage?: string;
  addCancelActionName?: string;
  editCancelActionName?: string;
  customActions?: ICustomAction[];
  defaultValue?: {
    [entityKey: string]: string | number | boolean | string[] | number[];
  };
  onChangeEventInEdit?: boolean;
  beformFillInForm?: (data: any) => any;
  beforSubmit?: (data: any) => any;
}

export interface IDetailView {
  order?: string[];
  actionId?: string | number;
  customActions?: ICustomAction[];
}

export interface IMultiView {
  customSubtitle?: string;
  order?: string[];
  colsWidth?: number[];
  submitActionName?: string;
  submitConfirmationMessage?: string;
  submitCancelActionName?: string;
  customRowActions?: ICustomAction[];
  customActions?: ICustomAction[];
  afterFetchDataActionName?: string;
  passwordTypeFor?: string;
  passwordValueFor?: string;
}

export interface IModel {
  modelName?: string;
  title?: string;
  customTitle?: {
    list?: string;
    add?: string;
    edit?: string;
    detail?: string;
    multi?: string; 
  };
  showList?: boolean;
  showForm?: boolean;
  showAll?: boolean;
  showDetail?: boolean;
  showMulti?: boolean;
  metaRequest?: boolean;
  entities?: {
    [entityKey: string]: IEntity;
  };
  permission?: Permission;
  pageName?: string;
  [LIST_VIEW]?: IListView;
  [FORM_VIEW]?: IFormView;
  [DETAIL_VIEW]?: IDetailView;
  [MULTI_VIEW]?: IMultiView;
}

export interface IMeta {
  actions: {
    [key in methods]: {
      [entity: string]: IEntity
    }
  };
  description: string;
  name: string;
  parses: string[];
  renders: string[];
}

export interface IListResponse<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}
export interface Permission {
  approveaccess?: boolean;
  createaccess?: boolean;
  deleteaccess?: boolean;
  editaccess?: boolean;
  viewaccess?: boolean;
}