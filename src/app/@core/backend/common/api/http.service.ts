/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { ServerDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import * as store from 'store2';

@Injectable()
export class HttpService {

  get apiUrl(): string {
    return environment.apiUrl;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector
  ) {}

  getServerDataSource(uri: string): DataSource {
    return new ServerDataSource(this.http,
      {
        endPoint: uri,
        totalKey: 'totalCount',
        dataKey: 'items',
        pagerPageKey: 'pageNumber',
        pagerLimitKey: 'pageSize',
        filterFieldKey: 'filterBy#field#',
        sortFieldKey: 'sortBy',
        sortDirKey: 'orderBy',
      });
  }

  get(endpoint: string, options?): Observable<any> {
    return new Observable(observer => {
      this.http.get(`${this.apiUrl}/${endpoint}`, options).subscribe(
        (response: any) => {
          if (response.status && response.status !== 200) {
            observer.error(response);
          } else {
            observer.next(response);
          }
        },
        (error) => {
          console.log(error);
          if (error.error.statusCode === 905) {
            if (store.has('adminuser') && store.get('adminuser')) {
              this.router.navigate(['auth/admin'])
            } else {
                this.router.navigate(['auth/login'])
            }
            localStorage.removeItem('currentUser');
          } else {
            observer.error(error.error);
          }
        })
    })
  }

  post(endpoint: string, data, options?): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/${endpoint}`, data, options).subscribe(
        (response: any) => {
          if (response.status && response.status !== 200) {
            observer.error(response);
          } else {
            observer.next(response);
          }
        },
        (error) => {
          if (error.error.statusCode === 905) {
            if (store.has('adminuser') && store.get('adminuser')) {
              this.router.navigate(['auth/admin'])
            } else {
                this.router.navigate(['auth/login'])
            }
            localStorage.removeItem('currentUser');
          } else {
            observer.error(error.error);
          }
        })
    })
  }

  put(endpoint: string, data, options?): Observable<any> {
    return new Observable(observer => {
      this.http.put(`${this.apiUrl}/${endpoint}`, data, options).subscribe(
        (response: any) => {
          if (response.status && response.status !== 200) {
            observer.error(response);
          } else {
            observer.next(response);
          }
        },
        (error) => {
          if (error.error.statusCode === 905) {
            if (store.has('adminuser') && store.get('adminuser')) {
              this.router.navigate(['auth/admin'])
            } else {
                this.router.navigate(['auth/login'])
            }
            localStorage.removeItem('currentUser');
          } else {
            observer.error(error.error);
          }
        })
    })
  }

  delete(endpoint: string, options?): Observable<any> {
    return new Observable(observer => {
      this.http.delete(`${this.apiUrl}/${endpoint}`, options).subscribe(
        (response: any) => {
          if (response.status && response.status !== 200) {
            observer.error(response);
          } else {
            observer.next(response);
          }
        },
        (error) => {
          if (error.error.statusCode === 905) {
            if (store.has('adminuser') && store.get('adminuser')) {
              this.router.navigate(['auth/admin'])
            } else {
                this.router.navigate(['auth/login'])
            }
            localStorage.removeItem('currentUser');
          } else {
            observer.error(error.error);
          }
        })
    })
  }
}
