import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from '../backend/common/api/http.service';
import { AuthenticationService } from './authentication.service'
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly apiController: string = 'locations';

    constructor(private api: HttpService,
                private authService: AuthenticationService) {
    }
  
    list(company: number): Observable<any[]> {
      const params = new HttpParams()
        .set('company', `${company}`)

      return this.api.get(this.apiController, { params }).pipe(
        map(data => {
          return data.items;
        })
      )
    }
    
    uploadPhoto(photo: File): Observable<any> {
      const formData = new FormData();
      formData.append('photo', photo);

      return this.api.post(`${this.apiController}/uploadPhoto`, formData);
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