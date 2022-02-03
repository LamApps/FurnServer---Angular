import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpService } from '../backend/common/api/http.service';
import { map } from 'rxjs/operators';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private readonly apiController: string = 'code';

  constructor(private api: HttpService) { }

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
  getOne(id: number): Observable<any> {
    return this.api.get(`${this.apiController}/${id}`);
  }
  update(item: any): Observable<any> {
    return this.api.put(`${this.apiController}/${item.id}`, item);
  }

  delete(id: number): Observable<boolean> {
    return this.api.delete(`${this.apiController}/${id}`);
  }

  add(data:any): Observable<any> {
    return this.api.post(this.apiController, data);
  }

}
