/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils';
import { InitUserService } from './@theme/services/init-user.service';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { AdminuserService } from './@core/@services/adminuser.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private analytics: AnalyticsService,
              private userService: AdminuserService,
              private initUserService: InitUserService) {
              this.initUser();
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
  }

  initUser() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
