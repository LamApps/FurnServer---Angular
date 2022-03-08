import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../@models/user';
import { HttpService } from '../backend/common/api/http.service';

import store from 'store2';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(
		private http: HttpService,
	) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }
		
	public isAdmin(): boolean {
		return store.get('adminuser');
	}

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    setUserValue(user: any) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    login(user: any, isAdmin: boolean) {
		if (isAdmin) {		
			return this.http.post('auth/admin', user)
				.pipe(map(response => {
					if (response.status === 200) {
						let user = response.user
						store.set('adminuser', true)
						localStorage.setItem('currentUser', JSON.stringify(user))
						this.currentUserSubject.next(user)
						return user
					} else {
						throw new Error(response.message)
					}
				}));

		} else {
			return this.http.post('auth/login', user)
				.pipe(map(response => {
					if (response.status === 200) {
						let user = response.user
						console.log(user)
						store.set('adminuser', false)
						localStorage.setItem('currentUser', JSON.stringify(user))
						this.currentUserSubject.next(user)
						return user
					} else {
						throw new Error(response.message)
					}
				}));
		}
    }

	
    getDatabase(item: any): Observable<any> {
		return this.http.get('auth/database', { params: item });
	  }

    signup(user: any) {
        return this.http.post('auth/register', user)
			.pipe(map(response => {
				if (response.status == 200) {
					return response
				} else {
					throw new Error(response.message)
				}
			}))
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}