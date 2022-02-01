import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NumberValueAccessor, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { NbToastrService } from '@nebular/theme';
import { Router, ActivatedRoute } from '@angular/router';
import { DATABASE_PATTERN, EMAIL_PATTERN, NUMBERS_PATTERN } from '../../../@auth/components';
import { User } from '../../../@core/@models/user'
import { UserService } from '../../../@core/@services/user.service';
import { Company } from '../../../@core/@models/company';
import { CompanyService } from '../../../@core/@services/company.service';
import { AuthenticationService } from '../../../@core/@services/authentication.service';
import { DatePipe } from '@angular/common';
import { NbDialogService } from '@nebular/theme';
import { ResetPasswordComponent } from 'app/@components/reset-password/reset-password';
import { createPasswordStrengthValidator, createTimeoutValidator } from 'app/@theme/components';
import { CompanyRoleService } from 'app/@core/@services/company-role.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  companyList: Company[] = [];
  company;
  database_list: string[] = [];
  roleList = [];
  selected_database: string = "";

  protected readonly unsubscribe$ = new Subject<void>();

  get database() { return this.formGroup.get('database'); }
  get default_database() { return this.formGroup.get('default_database'); }
  get username() { return this.formGroup.get('username'); }
  get password() { return this.formGroup.get('password'); }
  get confirm() { return this.formGroup.get('confirm'); }
  get email() { return this.formGroup.get('email'); }
  get firstname() { return this.formGroup.get('firstname'); }
  get lastname() { return this.formGroup.get('lastname'); }
  get role() { return this.formGroup.get('role'); }
  get birthday() { return this.formGroup.get('birthday'); }
  get position() { return this.formGroup.get('position'); }
  get salesperson_code() { return this.formGroup.get('salesperson_code'); }
  get selling_location() { return this.formGroup.get('selling_location'); }
  get timeout() { return this.formGroup.get('timeout'); }

  title: string;
  mode: FormMode;
  editing: boolean = false;
  changed_password: string = '';

  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit User";
      this.editing = true;
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create User";
      this.editing = false;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private userService: UserService,
    private datePipe: DatePipe,
    private companyService: CompanyService,
    private authService: AuthenticationService,
    private companyRoleService: CompanyRoleService,
    private dialogService: NbDialogService
  ) { 
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      database: this.formBuilder.control('', [Validators.required, Validators.pattern(DATABASE_PATTERN)]),
      default_database: this.formBuilder.control(''),
      username: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      password: this.formBuilder.control('', [Validators.required,  Validators.minLength(6), createPasswordStrengthValidator()]),
      confirm: this.formBuilder.control('', [Validators.required,  Validators.minLength(6), createPasswordStrengthValidator()]),
      email: this.formBuilder.control('', [Validators.pattern(EMAIL_PATTERN)]),
      firstname: this.formBuilder.control('', [Validators.required, Validators.maxLength(20)]),
      lastname: this.formBuilder.control('', [Validators.required, Validators.maxLength(20)]),
      role: this.formBuilder.control('', [Validators.required]),
      position: this.formBuilder.control('', []),
      salesperson_code: this.formBuilder.control('', [Validators.maxLength(3), Validators.minLength(3)]),
      selling_location: this.formBuilder.control('', [Validators.maxLength(2), Validators.minLength(2)]),
      timeout: this.formBuilder.control('', [createTimeoutValidator()]),
      birthday: this.formBuilder.control(''),
      active: this.formBuilder.control(true),
      photo: this.formBuilder.control(''),
      mobile: this.formBuilder.control('')
    });
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          const uid = data.uid
          if (cid) {
            this.company = cid;
            this.loadUserData(uid);
            this.loadRoleList();
          } else {
            this.router.navigate(['/company/dashboard']);  
          }
        } catch (e) {
          this.router.navigate(['/company/dashboard']);
        }
      }
    });

    this.loadCompanyList();
  }

  get canEdit(): boolean {
    return this.mode !== FormMode.VIEW;
  }

  loadCompanyList() { 
    this.companyService.list().subscribe(
      data => {
        data.map(item=> {
          this.companyList.push(item);
        });
      }
    );
  }
  
  loadUserData(id) {
    if (id) {
      this.setViewMode(FormMode.EDIT);
      this.loadUser(id);
    } else {
      this.setViewMode(FormMode.ADD);
    }
  }

  loadRoleList() {
    this.companyRoleService.getCompanyRoles(this.company).subscribe(
      data => {
        this.roleList.push({
          id: -1,
          name: "Custom",
          menus: []
        })
        data.map(item => {
          this.roleList.push(item);
        });
      }
    )
  }

  loadUser(id: any) {
    this.userService.get(id).subscribe(user => {
      this.formGroup.removeControl('password');
      this.formGroup.removeControl('confirm');

      const hour = Math.floor(parseInt(user.timeout) / 60);
      const minute = parseInt(user.timeout) % 60;
      const timeout = hour.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                      }) + ":" + minute.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                      })

      this.formGroup.setValue({ 
        id: user.id,
        database: user.database,
        default_database: user.default_database,
        username: user.username,
        role: user.role ? user.role.id : -1,
        salesperson_code: user.salesperson_code || '',
        selling_location: user.selling_location || '',
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        position: user.position,
        birthday: user.birthday ? user.birthday : '',
        active: user.active,
        photo: user.photo,
        mobile: user.mobile,
        timeout: user.timeout == 0 ? '' : timeout
      });
      this.onBirthdayChange();
      this.database_list = user.database.split(",");
      this.selected_database = user.default_database;
      this.changed_password = '';
    });
  }

  onBirthdayChange() {
    let newValue = this.birthday.value.replace(/\D/g,'')
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2)
    }
    if (newValue.length >= 6) {
      newValue = newValue.slice(0, 5) + "/" + newValue.slice(5)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 10)
    }
    this.birthday.setValue(newValue)
    this.birthday.updateValueAndValidity()
    return true
  }

  convertToUser(value: any): User {
    const user: User = value;
    return user;
  }

  databseFormat(event): boolean {  
    let curValue = this.database.value
    let dbs = curValue.split(",")
    var newValue = ""
    for (let db of dbs) {
      let ndb = db.replace(/\D/g,'')
      if (ndb == "") continue
      if (newValue != "") newValue = newValue + ","
      newValue = newValue + ndb
    }
    if (curValue.slice(curValue.length - 1) == ",") {
      newValue = newValue + ","
    }
    if (newValue == ",") newValue = ""
    this.database_list = newValue.split(",")
    if (this.database_list[this.database_list.length - 1] == "") {
      this.database_list = this.database_list.slice(0, this.database_list.length - 1)
    }
    if (this.database_list.length > 0) {
      this.selected_database = this.database_list[0]
    } else {
      this.selected_database = ""
    }
    this.database.setValue(newValue)
    this.database.updateValueAndValidity()
    return true
  }

  focusoutDatabase() {
    let curValue = this.database.value
    let newValue = curValue
    if (curValue.length > 0 && curValue.slice(curValue.length - 1) == ",") {
      newValue = curValue.slice(0, curValue.length - 1)
    }
    this.database.setValue(newValue)
    this.database.updateValueAndValidity()
  }

  keyup(target) {
    let curValue = target.value
    let newValue = ""
    if (target == this.salesperson_code) {
      newValue = curValue.replace(/[\W_]+/g, '');
      if (newValue.length > 3) {
        newValue = newValue.slice(0, 3)
      }
    } else if (target == this.selling_location) {
      newValue = curValue.replace(/[\W_]+/g, '');
      if (newValue.length > 2) {
        newValue = newValue.slice(0, 2)
      }
    }
    target.setValue(newValue)
  }

  reset_password() {
    this.dialogService.open(ResetPasswordComponent)
      .onClose.subscribe(password => {
        this.changed_password = password;
      })
  }


  valid_submit(): boolean {
    if (this.submitted) return false;
    if (!this.formGroup.valid) return false;
    if (this.editing) return true;
    if (this.password.value != this.confirm.value) return false;
    return true;
  }

  submit(): void {
    var user = this.formGroup.value;
    console.log(user);
    this.submitted = true;
    const timeout = user.timeout.toString().split(":");
    if (timeout.length == 2) {
      user.timeout = parseInt(timeout[0]) * 60 + parseInt(timeout[1]);
    } else {
      user.timeout = 0;
    }
    if (user.database.slice(user.database.length - 1) == ",") {
      user.database = user.database.slice(0, user.database.length - 1)
    }

    if (user.birthday && user.birthday != "") {
      const birthday = new Date(user.birthday).toLocaleDateString()
      user = { ...user, birthday: birthday }
    } else {
      user = { ...user, birthday: "" }
    }

    user.company = this.company

    if (this.editing) {
      user.password = this.changed_password;
    }

    if (this.mode == FormMode.ADD) {
      this.authService.signup(user).subscribe(
        data => {
          this.toasterService.success('', 'User created!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.userService.update(user).subscribe(
        data => {
          this.toasterService.success('', 'Company updated!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    const params = JSON.stringify({ cid: this.company }) 
    this.router.navigate(['/company/users/list'], { queryParams: { data: encodeURI(params) }});
  }

  onImageChange($event: Event) { 

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}