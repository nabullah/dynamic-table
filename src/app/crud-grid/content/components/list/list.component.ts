import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { IListResponse, IObjectKeys } from '../../../core/interfaces';
import { ConfigService } from '../../../core/services/config.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ecc-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent<T extends IObjectKeys> implements OnInit, AfterViewInit {

  @ViewChild(MatTable) table!: MatTable<T[]>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public dataSource: Observable<T[]>;
  public dataLength: number;

  public globalFilterText?: string;

  deleteDialog!: MatDialogRef<ConfirmDialogComponent>;

  constructor(
    public configService: ConfigService<T>,
    private dialog: MatDialog
  ) {
    this.dataSource = of([]);
    this.dataLength = 0;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource = merge(this.sort.sortChange, this.paginator.page, this.configService.updateDataTable)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.configService.loading = true;
          this.dataLength = 0;
          return this.configService.fetchListData(
            (this.configService.config.model.listView?.pagination ? this.paginator.pageSize : null)!,
            (this.configService.config.model.listView?.pagination ? this.paginator.pageSize * this.paginator.pageIndex : null)!,
            this.configService.getOrderField(this.sort),
            (this.configService.config.model.listView?.globalFilter && this.globalFilterText || null),
            (this.configService.config.model.listView?.columnFilter && (
              Object.entries(
                this.configService.config.model.listView?.columnFilterOptions || {}
              ).reduce((a: any, [k, v]) => (v.value ? (a[v.exact_mode ? `${v.filterMatchMode}` :`${k}__${v.filterMatchMode}`] = v.value, a) : a), {})
            ) || null)
          );
        }),
        map((data: (IListResponse<T> | T[])) => {
          this.configService.loading = false;
          this.configService.error = false;
          let response = []; 
          if (this.configService.config.model.listView?.pagination) {
            const responseData = data as IListResponse<T>;
            this.dataLength = responseData.count;
            response = responseData.results;
          } else {
            response = data as T[];
            this.dataLength = response.length;
          }
          if (this.configService.config.model.listView?.afterFetchListActionName) {
            this.configService.customActionEvent(this.configService.config.model.listView.afterFetchListActionName, response);
          }
          return response
        }),
        catchError(() => {
          this.configService.loading = false;
          this.configService.error = true;
          return of([]);
        })
      );
  }

  onGlobalFilter(event: Event): void {
    this.globalFilterText = (event.target as HTMLInputElement).value;
    this.paginator.pageIndex = 0;
    this.configService.updateDataTable.next(null);
  }

  onColumnFilter(): void {
    this.paginator.pageIndex = 0;
    this.configService.updateDataTable.next(null);
  }

  onAdd(): void {
    this.configService.displayAdd();
  }

  onEdit(row: T): void {
    this.configService.displayEdit(row);
  }

  openConfirmDialog(row: T): void {
    this.deleteDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete it?'
      }
    });

    this.deleteDialog.afterClosed().subscribe((yesClicked: boolean) => {
      if (yesClicked) {
        this.onDelete(row);
      }
    });
  }

  onDelete(row: T): void {
    this.configService.deleteData(row);
  }

  onChangePage(event: PageEvent) {
    this.configService.setPageLimit(event.pageSize);
  }
}
