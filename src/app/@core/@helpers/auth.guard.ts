import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import * as store from 'store2';
import { JwtHelperService } from "@auth0/angular-jwt";

import { AuthenticationService } from '../@services/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }
	
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue
        if (!currentUser) {
            if (store.has('adminuser') && store.get('adminuser')) {
                this.router.navigate(['auth/admin'])
            } else {
                this.router.navigate(['auth/login'])
            }
            return false    
        }
        const token = currentUser.token

        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(token);
        if (new Date().getTime() / 1000 > decodedToken.exp) {
            if (store.has('adminuser') && store.get('adminuser')) {
                this.router.navigate(['auth/admin'])
            } else {
                this.router.navigate(['auth/login'])
            }
            this.authenticationService.logout()
            return false
        }
        return true;
    }
}