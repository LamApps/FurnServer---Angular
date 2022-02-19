/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NB_AUTH_OPTIONS,
  NbAuthSocialLink,
  NbAuthService,
  NbAuthResult,
} from '@nebular/auth';
import { getDeepFromObject } from '../../helpers';
import { NbThemeService, NbDateService } from '@nebular/theme';
import { EMAIL_PATTERN, NUMBERS_PATTERN, USERNAME_PATTERN } from '../constants';
import { UsersApi } from '../../../@core/backend/common/api/users.api';
import { AuthenticationService } from '../../../@core/@services/authentication.service';

import { map } from 'rxjs/operators';

@Component({
  selector: 'ngx-login',
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NgxLoginComponent implements OnInit {

  minLength: number = this.getConfigValue('forms.validation.password.minLength');
  maxLength: number = this.getConfigValue('forms.validation.password.maxLength');
  redirectDelay: number = this.getConfigValue('forms.login.redirectDelay');
  showMessages: any = this.getConfigValue('forms.login.showMessages');
  strategy: string = this.getConfigValue('forms.login.strategy');
  socialLinks: NbAuthSocialLink[] = this.getConfigValue('forms.login.socialLinks');

  errors: string[] = [];
  messages: string[] = [];
  user: any = {};
  submitted: boolean = false;
  loginForm: FormGroup;
  alive: boolean = true;

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get company_id() { return this.loginForm.get('company_id'); }
  get username() { return this.loginForm.get('username'); }
  get choose_company() { return this.loginForm.get('choose_company'); }

  constructor(protected service: NbAuthService,
    @Inject(NB_AUTH_OPTIONS) protected options = {},
    protected dateService: NbDateService<Date>,
    protected cd: ChangeDetectorRef,
    protected themeService: NbThemeService,
    private fb: FormBuilder,
    protected router: Router,
    protected authService: AuthenticationService,
    protected api: UsersApi) { }

  ngOnInit(): void {
    const companyIdValidators = [
      Validators.pattern(NUMBERS_PATTERN),
    ];

    const usernameValidators = [
      Validators.pattern(USERNAME_PATTERN),
      Validators.minLength(3),
      Validators.required
    ];

    const passwordValidators = [
      Validators.minLength(this.minLength),
      Validators.maxLength(this.maxLength),
      Validators.required
    ];

    const chooseCompanyValidator = [
    ]

    this.loginForm = this.fb.group({
      username: this.fb.control('', [...usernameValidators]),
      password: this.fb.control('', [...passwordValidators]),
      remember_username: this.fb.control(false)
    });
  }

  login(): void {
    this.user = this.loginForm.value;
    this.errors = [];
    this.messages = [];
    this.submitted = true;

    this.authService.login(this.user, true).subscribe(
      data => {
        this.submitted = false;
        this.cd.detectChanges();
        setTimeout(() => {
          return this.router.navigateByUrl('/admin/dashboard');
        }, this.redirectDelay);
      },
      error => {
        this.errors = [error];
        this.submitted = false;
        this.cd.detectChanges();
      }
    )
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null);
  }
}
