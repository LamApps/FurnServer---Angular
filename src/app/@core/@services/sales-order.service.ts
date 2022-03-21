import { Injectable } from '@angular/core';
import { HttpService } from '../backend/common/api/http.service';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private readonly apiController: string = 'sales-order';
  constructor(
    private http: HttpService,
  ) {}

  salesSearch(company:number, data:any): Observable<any> {
    return this.http.post(this.apiController+'/search', {company, data}).pipe(
      map((data:any) => {
        return data.response.dsHeader.dsHeader['tt-so-header'];
    }));
  }
  getOrderDetail(company:number, sa_no:string): Observable<any> {
    return this.http.post(this.apiController+'/get-detail', {company, sa_no}).pipe(
      map((data:any) => {
        return data.response.dsGSO.dsGSO;
    }));
  }
}
