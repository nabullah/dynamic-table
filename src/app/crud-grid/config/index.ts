import { ID } from '../core/constants';
import { IModel } from '../core/interfaces';

export class Config {
  public model: IModel;

  constructor() {
    this.model = {                          // ------
      modelName: '',                        // tested
      title: '',                            // tested
      showList: true,                       // tested
      showForm: false,                      // tested
      showDetail: false,                    // tested
      showMulti: false,
      showAll: false,
      metaRequest: true,
      entities: {},
      permission: {},
      listView: {                           // ------
        pagination: true,                   // tested
        limit: 5,                           // tested
        limitOptions: [5, 10, 25, 100],     // tested
        order: [],                          // tested
        columnFilterOptions: {},            // tested
        columnFilter: false,                // tested
        globalFilter: false,                // tested
        globalFilterLabel: 'Global Search', // tested
        actions: {                          // ------
          add: true,                        // tested
          edit: true,                       // tested
          delete: true,                     // tested
          view: false                       // no code
        },                                  // ------
        actionId: ID,                       // tested
        customRowActions: [],               // 1
        customActions: [],                  // 2
        actionsOnTop: false,
        fixHeader: false,
        isPersist: false
      },                                    // ------
      formView: {                           // ------
        order: [],                          // tested
        addActionDisabled: false,           // tested
        colsWidth: [100],                   // tested
        actionId: ID,                       // tested
        customActions: [],                  // 3
        defaultValue: {},
        onChangeEventInEdit: true
      },                                    // ------
      detailView: {                         // ------
        order: [],                          // no code
        actionId: ID,                       // no code
        customActions: []                   // no code
      },                                    // ------
      multiView: {
        order: [],
        customRowActions: [],
        customActions: [],
        colsWidth:[]
      }
    };
  }
}
