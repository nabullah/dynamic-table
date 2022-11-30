import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { IParams } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class GenericService {
  // API_CONFIG: EnvironmentConfiguration;
  API_CONFIG: any ;

  constructor(
    private http: HttpClient,
    // private environmentConfigurationService: EnvironmentConfigurationService
  ) {
    // this.API_CONFIG = this.environmentConfigurationService.config;
    this.API_CONFIG = environment;
  }

  // CREATE
  create<T extends object, U extends keyof T, V>(model: T, tableName: U, objToCreate: V | FormData): Observable<V> {
    return this.http.post<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/`, objToCreate);
  }

  // READ
  readAll<T extends object, U extends keyof T, V>(model: T, tableName: U, extra?: HttpParams | IParams): Observable<V> {
    const params = extra ? extra : {};
    return this.http.get<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/`, { params });
  }

  // READ ONE
  readOne<T extends object, U extends keyof T, V extends object, W extends keyof V>(
    model: T,
    tableName: U,
    objToRead: V,
    id: W,
    extra?: HttpParams | IParams
  ): Observable<V> {
    const params = extra ? extra : {};
    return this.http.get<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/${objToRead[id]}/`, { params });
  }

  // UPDATE
  update<T extends object, U extends keyof T, V extends object, W extends keyof V>(
    model: T,
    tableName: U,
    objToUpdate: V | FormData,
    id: W
  ): Observable<V> {
    const objId = objToUpdate instanceof FormData ? objToUpdate.get(id as string) : objToUpdate[id];
    return this.http.patch<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/${objId}/`, objToUpdate);
  }

  // UPDATE
  put<T extends object, U extends keyof T, V extends object, W extends keyof V>(
    model: T,
    tableName: U,
    objToUpdate: V | FormData,
    id: W
  ): Observable<V> {
    const objId = objToUpdate instanceof FormData ? objToUpdate.get(id as string) : objToUpdate[id];
    return this.http.put<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/${objId}/`, objToUpdate);
  }

  // PATCH ONLY
  patchOnly<T extends object, U extends keyof T, V>(model: T, tableName: U, objToCreate: V | FormData): Observable<V> {
    return this.http.patch<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/`, objToCreate);
  }

  // DELETE
  delete<T extends object, U extends keyof T, V extends object, W extends keyof V>(
    model: T,
    tableName: U,
    objToDelete: V,
    id: W
  ): Observable<V> {
    return this.http.delete<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/${objToDelete[id]}/`);
  }

  // META
  meta<T extends object, U extends keyof T, V>(model: T, tableName: U, extra?: HttpParams | IParams): Observable<V> {
    const params = extra ? extra : {};
    // return this.http.options<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/`, { params });
    return this.http.get<V>(`${this.API_CONFIG.baseUrl}/${model[tableName]}/`, { params });
  }

  upload(data:any, endpoint:any) {
    return this.http.post(`${this.API_CONFIG.baseUrl}/${endpoint}/`, data, { observe: 'response', responseType: 'blob' });
  }

  download(endpoint:any) {
    return this.http.get(`${this.API_CONFIG.baseUrl}/${endpoint}/`, { observe: 'response', responseType: 'blob' });
  }
}
