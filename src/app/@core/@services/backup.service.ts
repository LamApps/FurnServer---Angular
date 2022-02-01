import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { HttpService } from '../backend/common/api/http.service';
import { AuthenticationService } from './authentication.service'
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BackupService {
    private readonly apiController: string = 'utils/backup';

    constructor(private api: HttpService,
                private authService: AuthenticationService) {
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
    
    download(id: number): Observable<any> {
      return this.api.get(`${this.apiController}/${id}`, { responseType: 'blob' });
    }
  
    delete(id: number): Observable<boolean> {
      return this.api.delete(`${this.apiController}/${id}`);
    }
  
    add(): Observable<any> {
      return this.api.post(this.apiController, {});
    }
}