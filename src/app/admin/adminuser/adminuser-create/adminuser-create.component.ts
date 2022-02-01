import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NbToastrService } from '@nebular/theme';
import { Router, ActivatedRoute } from '@angular/router';
import { EMAIL_PATTERN, NUMBERS_PATTERN } from '../../../@auth/components';
import { Adminuser } from '../../../@core/@models/adminuser'
import { AdminuserService } from '../../../@core/@services/adminuser.service';
import { Company } from '../../../@core/@models/company';
import { CompanyService } from '../../../@core/@services/company.service';
import { Roles } from '../../../@core/@models/roles';
import { RolesService } from '../../../@core/@services/roles.service';
import { AuthenticationService } from '../../../@core/@services/authentication.service';
import { D0Types } from '@swimlane/ngx-charts';
import { DatePipe } from '@angular/common';
import { NbDialogService } from '@nebular/theme';
import { ResetPasswordComponent } from 'app/@components/reset-password/reset-password';
import { createPasswordStrengthValidator } from 'app/@components/validation-message/validation-message.component';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-user-create',
  templateUrl: './adminuser-create.component.html',
  styleUrls: ['./adminuser-create.component.scss']
})
export class AdminuserCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;

  rolesList: Roles[] = [];
  companyList: Company[] = [];

  protected readonly unsubscribe$ = new Subject<void>();

  get username() { return this.formGroup.get('username'); }
  get password() { return this.formGroup.get('password'); }
  get confirm() { return this.formGroup.get('confirm'); }
  get email() { return this.formGroup.get('email'); }
  get firstname() { return this.formGroup.get('firstname'); }
  get lastname() { return this.formGroup.get('lastname'); }
  get role() { return this.formGroup.get('roles'); }
  get roles() { return this.formGroup.get('roles'); }
  get birthday() { return this.formGroup.get('birthday'); }
  get position() { return this.formGroup.get('position'); }

  title: string;
  mode: FormMode;
  editing: boolean = false;
  changed_password: string = '';

  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Admin User";
      this.editing = true;
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Admin User";
      this.editing = false;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private userService: AdminuserService,
    private datePipe: DatePipe,
    private companyService: CompanyService,
    private rolesService: RolesService,
    private authService: AuthenticationService,
    private dialogService: NbDialogService
  ) { 
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      username: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      password: this.formBuilder.control('', [Validators.required, Validators.minLength(6), createPasswordStrengthValidator()]),
      confirm: this.formBuilder.control('', [Validators.required, Validators.minLength(6), createPasswordStrengthValidator()]),
      email: this.formBuilder.control('', [Validators.pattern(EMAIL_PATTERN)]),
      firstname: this.formBuilder.control('', [Validators.minLength(1), Validators.maxLength(20)]),
      lastname: this.formBuilder.control('', [Validators.minLength(1), Validators.maxLength(20)]),
      role: this.formBuilder.control('', []),
      roles: this.formBuilder.control('', []),
      position: this.formBuilder.control('', []),
      birthday: this.formBuilder.control(''),
      active: this.formBuilder.control(true),
    });

    this.loadRolesList();
    this.loadUserData();
  }

  get canEdit(): boolean {
    return this.mode !== FormMode.VIEW;
  }

  loadRolesList() { 
    this.rolesService.list().subscribe(
      data => {
        data.map(item=> {
          this.rolesList.push(item);
        });
      }
    );
  }
  
  loadUserData() {
    this.setViewMode(FormMode.ADD);
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const uid = data.uid
          if (uid) {
            this.setViewMode(FormMode.EDIT);
            this.loadUser(uid);    
          }
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
      }
    });
  }

  loadUser(id: any) {
    this.userService.get(id).subscribe(user => {
      this.formGroup.removeControl('password');
      this.formGroup.removeControl('confirm');
      this.formGroup.setValue({ 
        id: user.id,
        username: user.username,
        role: user.roles,
        roles: user.roles,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        position: user.position,
        birthday: user.birthday ? user.birthday : '',
        active: user.active,
      });
    });
    this.onBirthdayChange();
    this.changed_password = '';
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

  convertToUser(value: any): Adminuser {
    const user: Adminuser = value;
    return user;
  }

  reset_password() {
    this.dialogService.open(ResetPasswordComponent)
      .onClose.subscribe(password => {
        this.changed_password = password;
      })
  }

  submit(): void {
    var user = this.formGroup.value;
    this.submitted = true;

    if (user.password != user.confirm) {
      this.toasterService.danger('', 'Invalid password');
      return;
    }
	  user.role = '0';

    if (user.birthday && user.birthday != "") {
      const birthday = new Date(user.birthday).toLocaleDateString()
      user = { ...user, birthday: birthday }
    } else {
      user = { ...user, birthday: "" }
    }
 
    if (this.editing) {
      user.password = this.changed_password;
    }

    if (this.mode == FormMode.ADD) {
      this.userService.add(user).subscribe(
        data => {
          this.toasterService.success('', 'Admin User created!');
          this.submitted = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.userService.update(user).subscribe(
        data => {
          this.toasterService.success('', 'Admin User updated!');
          this.submitted = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/users/list/']);
  }

  onImageChange($event: Event) { 

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
