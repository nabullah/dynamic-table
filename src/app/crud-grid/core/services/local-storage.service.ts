import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private LIST_VIEW_LIMIT = 'ecc:list-view:limit';

  constructor() { }

  private getStorageKeyForLimit(modelName: string): string {
    return `${this.LIST_VIEW_LIMIT}-${modelName}`;
  }

  /**
   * Get limit
   */
  public getLimit(modelName: string): Observable<number> {
    const limit = localStorage.getItem(this.getStorageKeyForLimit(modelName));
    return of(<number>JSON.parse(limit!))
  }

  /**
   * Set limit
   */
   public setLimit(modelName: string, limit: number): LocalStorageService {
    localStorage.setItem(this.getStorageKeyForLimit(modelName), JSON.stringify(limit));
    return this;
  }
}
