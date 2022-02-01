/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from 'app/@core/@services/authentication.service';

@Component({
  selector: 'ngx-logout',
  templateUrl: './logout.component.html',
})
export class NgxLogoutComponent implements OnInit {

  constructor(protected authService: AuthenticationService,
              protected router: Router) { }

  ngOnInit(): void {
    this.logout();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('');
  }
}
