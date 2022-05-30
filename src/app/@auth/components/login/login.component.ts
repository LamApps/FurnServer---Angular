/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Location } from '@angular/common';
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
import { UsersApi } from '../../../../app/@core/backend/common/api/users.api';
// import { AdminusersApi } from 'app/@core/backend/common/api/users.api';
import { AuthenticationService } from '../../../../app/@core/@services/authentication.service'
import store from 'store2';
import { UserService } from '../../../../app/@core/@services/user.service';
import { HttpClient } from '@angular/common/http';
import { createPasswordStrengthValidator } from '../../../../app/@components/validation-message/validation-message.component';
import { ChatService } from '../../../../app/@core/@services/chat.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NgxLoginComponent implements OnInit {

  minLength: number = this.getConfigValue('forms.validation.password.minLength')
  maxLength: number = this.getConfigValue('forms.validation.password.maxLength')
  redirectDelay: number = this.getConfigValue('forms.login.redirectDelay')
  showMessages: any = this.getConfigValue('forms.login.showMessages')
  strategy: string = this.getConfigValue('forms.login.strategy')
  socialLinks: NbAuthSocialLink[] = this.getConfigValue('forms.login.socialLinks')
  isAdmin: boolean = false;

  errors: string[] = []
  messages: string[] = []
  user: any = {}
  submitted: boolean = false
  loginForm: FormGroup
  alive: boolean = true

  database: string[] = ["1"]
  default_database: string = "1"
  ip_address = ''

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  get company_id() { return this.loginForm.get('company_id'); }
  get username() { return this.loginForm.get('username'); }
  get company_database() { return this.loginForm.get('company_database'); }

  constructor(protected service: NbAuthService,
    @Inject(NB_AUTH_OPTIONS) protected options = {},
    private ngZone: NgZone,
    protected dateService: NbDateService<Date>,
    protected cd: ChangeDetectorRef,
    protected themeService: NbThemeService,
    private fb: FormBuilder,
    protected router: Router,
    protected location: Location,
    protected authService: AuthenticationService,
    protected userService: UserService,
    protected chatService: ChatService,
    protected api: UsersApi,
    private http: HttpClient) { 	
		router.events.subscribe((val) => {
		  if (location.path() == '/auth/admin') {
			  this.isAdmin = true
		  } 
		})
	}

  ngOnInit(): void {
    const companyIdValidators = [
    ]
    if (!this.isAdmin) {
      companyIdValidators.push(Validators.required)
    }

    const usernameValidators = [
      Validators.pattern(USERNAME_PATTERN),
      Validators.minLength(3),
      Validators.required
    ]

    const passwordValidators = [
      Validators.minLength(6),
      Validators.required,
      createPasswordStrengthValidator()
    ]

    this.loginForm = this.fb.group({
      company_id: this.fb.control('', [...companyIdValidators]),
      username: this.fb.control('', [...usernameValidators]),
      password: this.fb.control('', [...passwordValidators]),
      remember_company_id: this.fb.control(false),
      remember_username: this.fb.control(false),
      company_database: this.fb.control(''),
    })
    if (this.hasRememberUsernameValue() || this.hasRememberCompanyValue()) {
      this.loadCookieData()
    }
    this.userChange();
    this.getIPAddress();
  }

  getIPAddress() {
    this.http.get("https://api.ipify.org?format=json").subscribe((res:any) => {
      this.ip_address = res.ip;
    });
  }

  getBrowser() { 
    if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
        return 'Opera';
    } else if (navigator.userAgent.indexOf("Chrome") != -1 ) {
        return 'Chrome';
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return 'Safari';
    } else if (navigator.userAgent.indexOf("Firefox") != -1 ) {
         return 'Firefox';
    } else if ((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.DOCUMENT_NODE == true )) {
      return 'IE'; 
    } else {
       return 'unknown';
    }
  }

  getOperatingSystem() {
    if (navigator.userAgent.indexOf("Win") != -1) return "Windows";
    if (navigator.userAgent.indexOf("Mac") != -1) return "Mac";
    if (navigator.userAgent.indexOf("Linux") != -1) return "Linux";
    if (navigator.userAgent.indexOf("Android") != -1) return "Android";
    if (navigator.userAgent.indexOf("iOS") != -1) return "iOS";
    return "Unknown"
  }

  hasRememberUsernameValue() {
    if (store.has('username')) return true
    return false
  }
  
  hasRememberCompanyValue() {
    if (store.has('company_id')) return true
    return false
  }
  
  getCookieValue(key: any){
	  return document.cookie
		  .split('; ')
		  .find(row => row.startsWith(key + '='))
		  .split('=')[1]
  }

  loadCookieData() {
	  var remember_usernameValue = false
	  var remember_company_idValue = false
	  var usernameValue = ''
	  var company_idValue = ''
    
	  if (this.hasRememberUsernameValue()) {
		  usernameValue = store.get('username')
		  remember_usernameValue = true
	  }
	  if (this.hasRememberCompanyValue()) {
		  company_idValue = store.get('company_id')
		  remember_company_idValue = true
	  }
    this.loginForm.setValue({
      username: usernameValue, 
      password: '',
      company_id: company_idValue,
      remember_username: remember_usernameValue,
      remember_company_id: remember_company_idValue,
      company_database: this.default_database
    })
  }
  
  userChange() {
    let n_id = this.company_id.value
    let n_username = this.username.value
    let req = { username: n_username, company: n_id }
    this.authService.getDatabase(req).subscribe(
      data => {
        if (data.status == 200) {
          let result = data.result
          this.ngZone.run( () => {
            this.database = result.database.split(",")
            this.default_database = result.default_database 
         });
        } else {
          this.database = [ "1" ]
          this.default_database = "1"
        }
      },
      error => {
      }
    )
  }

  login(): void {
    if (!this.loginForm.valid) return
    
    this.user = this.loginForm.value
    this.user.company = this.user.company_id
    this.errors = []
    this.messages = []
    this.submitted = true;
    if (this.loginForm.controls.remember_username.value) {
      store.set('username', this.loginForm.controls.username.value)
    } else {
      store.remove('username')
    }
    if (this.loginForm.controls.remember_company_id.value) {
      store.set('company_id', this.loginForm.controls.company_id.value)
    } else {
      store.remove('company_id')
    }
    this.user.ip_address = this.ip_address
    this.user.browser = this.getBrowser();
    this.user.operating_system = this.getOperatingSystem();
    this.user.last_login_date = new Date().toLocaleDateString()
    this.user.last_login_time = new Date().toLocaleTimeString()
    this.user.last_login_database = this.user.company_database


    this.authService.login(this.user, this.isAdmin).subscribe(
      data => {
        this.submitted = false;
        this.chatService.connect(data);
        this.chatService.emit('userLogin', {fullName: data.firstname+' '+data.lastname, company: data.company?data.company.name:'Admin', avatar: data.photo, userId: data.id})
        this.cd.detectChanges()
        setTimeout(() => {
          if (this.isAdmin) {
            return this.router.navigateByUrl('/admin/dashboard')
          } else {
            return this.router.navigateByUrl('/company/dashboard')
          }
        }, this.redirectDelay)
      },
      error => {
        if (error.status == 500) this.errors.push("Username/Password Incorrect")
        else this.errors = [error.message]
        this.submitted = false
        this.cd.detectChanges()
      }
    )
  }

  getConfigValue(key: string): any {
    return getDeepFromObject(this.options, key, null)
  }
}