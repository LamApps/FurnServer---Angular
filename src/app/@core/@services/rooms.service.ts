import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { HttpService } from '../backend/common/api/http.service';
import { AuthenticationService } from './authentication.service'
import { Observable } from 'rxjs'; 
  
@Injectable({ providedIn: 'root' })
export class RoomsService {
    private readonly apiController: string = 'rooms';

    constructor(private api: HttpService, 
                private authService: AuthenticationService) { 
    }
  
    list(company: number = 0): Observable<any[]> {
      const params = new HttpParams()
      .set('company', `${company}`);
      return this.api.get(this.apiController, { params }).pipe(
        map(data => {
          return data.items;
        })
      )
    }
    
    verify(password: any) {
      return this.api.post(`${this.apiController}/verify`, password);
    }

    get(id: number): Observable<any> {
      return this.api.get(`${this.apiController}/${id}`)
        .pipe(
          map(data=> {
            return data.item;
          })
        );
    }
    getPublic(id: number): Observable<any> {
      return this.api.get(`${this.apiController}/public/${id}`)
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