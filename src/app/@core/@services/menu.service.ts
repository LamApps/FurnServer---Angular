import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { HttpService } from '../backend/common/api/http.service';
import { AuthenticationService } from './authentication.service'
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
    private readonly apiController: string = 'menu';

    constructor(private api: HttpService,
                private authService: AuthenticationService) {
    }
      
    get companyDataSource(): DataSource {
      return this.api.getServerDataSource(`${this.api.apiUrl}/${this.apiController}`);
    }
  
    list(pageNumber: number = 1, pageSize: number = 10): Observable<any[]> {
      const params = new HttpParams()
        .set('pageNumber', `${pageNumber}`)
        .set('pageSize', `${pageSize}`);

      return this.api.get(this.apiController, { params }).pipe(
        map(data => {
          return data.items;
        })
      )
    }
    
    get(id: number): Observable<any> {
      return this.api.get(`${this.apiController}/${id}`)
        .pipe(
          map(data=> {
            return data.item;
          })
        );
    }
  
    delete(id: number): Observable<boolean> {
      return this.api.delete(`${this.apiController}/${id}`);
    }
  
    add(item: any): Observable<any> {
      return this.api.post(this.apiController, item);
    }
  
    update(item: any): Observable<any> {
      return this.api.put(`${this.apiController}/${item.id}`, item);
    }
}