import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { Adminuser } from '../@models/adminuser';
import { HttpService } from '../backend/common/api/http.service';
import { AuthenticationService } from './authentication.service'
import { BehaviorSubject, Observable } from 'rxjs';
import { isJSDocThisTag } from 'typescript';

@Injectable({ providedIn: 'root' })
export class AdminuserService {
    private currentUserSubject: BehaviorSubject<Adminuser>;
    public currentUser: Observable<Adminuser>;
    private readonly apiController: string = 'adminuser';

    constructor(private api: HttpService,
                private authService: AuthenticationService) {
        this.currentUserSubject = new BehaviorSubject<Adminuser>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }
  
    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    get usersDataSource(): DataSource {
      return this.api.getServerDataSource(`${this.api.apiUrl}/${this.apiController}`);
    }
  
    list(pageNumber: number = 1, pageSize: number = 10): Observable<any[]> {
      const params = new HttpParams()
        .set('pageNumber', `${pageNumber}`)
        .set('pageSize', `${pageSize}`);

      return this.api.get(this.apiController, { params }).pipe(
        map(data => {
          return data.items;
        }))
    }
  
    getCurrent(): Observable<any> {
      return this.api.get(`${this.apiController}/current`)
        .pipe(map(data => {
            let user = { token: this.authService.currentUserValue.token, ...data };
            localStorage.setItem('currentUser', JSON.stringify(user)); 
            this.currentUserSubject.next(user);
            return user;
        }));
    }
  
    get(id: number): Observable<any> {
      return this.api.get(`${this.apiController}/${id}`).pipe(map(data => { return data.item }));
    }
  
    delete(id: number): Observable<boolean> {
      return this.api.delete(`${this.apiController}/${id}`);
    }
  
    add(item: any): Observable<any> {
      return this.api.post(this.apiController, item);
    }
  
    updateCurrent(item: any): Observable<any> {
      return this.api.put(`${this.apiController}`, item);
    }
  
    update(item: any): Observable<any> {
      return this.api.put(`${this.apiController}/${item.id}`, item);
    }

    uploadPhoto(photo: File): Observable<any> {
      const formData = new FormData();
      formData.append('photo', photo);

      return this.api.post(`${this.apiController}/uploadPhoto`, formData);
    }
}