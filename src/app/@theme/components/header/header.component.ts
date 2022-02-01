/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { LayoutService, RippleService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AuthenticationService } from 'app/@core/@services/authentication.service';
import { User } from 'app/@core/@models/user';
import { environment } from 'environments/environment';
import * as store from 'store2';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  public readonly materialTheme$: Observable<boolean>;

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: User;
  photo;
  company;

  themes = [
    {
      value: 'material-light',
      name: 'Material Light',
    },
    {
      value: 'material-dark',
      name: 'Material Dark',
    },
  ];

  currentTheme = 'material-light';

  userMenu = this.getMenuItems();

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private authService: AuthenticationService,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              private rippleService: RippleService) {
    this.materialTheme$ = this.themeService.onThemeChange()
      .pipe(
        map(theme => {
          const themeName: string = (theme && theme.name) || '';
          return themeName.startsWith('material');
      }));
  }
  
  getCookieValue(key: any){
	  return document.cookie
		  .split('; ')
		  .find(row => row.startsWith(key + '='))
		  .split('=')[1];
  }

  getMenuItems() {
	  var userLink = '';
    if (store.get('adminuser')) userLink = this.user ? '/admin/users/current/' : '';
    else userLink = this.user ? `/company/users/current/` : '';
    return [
      { title: 'Profile', link: userLink},
      { title: 'Log out', link: '/auth/logout' },
    ]
  }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;
    this.user = this.authService.currentUserValue;
    if (this.user.photo != "") {
      this.photo = environment.baseUrl + "/" + this.user.photo;
    } else {
      this.photo = "";
    }

    this.userMenu = this.getMenuItems();

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.currentTheme = themeName;
        this.rippleService.toggle(themeName.startsWith('material'));
      });

      this.authService.currentUser
      .subscribe(user => {
        this.user = this.authService.currentUserValue;
        if (!this.user) { return }
        if (this.user.photo != "") {
          this.photo = environment.baseUrl + "/" + this.user.photo;
        } else {
          this.photo = "";
        }
      })
  }

  ngOnChanges() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
