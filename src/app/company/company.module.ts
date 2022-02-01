/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { NgModule } from '@angular/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule, 
  NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbUserModule,
  NbMenuModule
} from '@nebular/theme';
import { FormsModule as ngFormsModule, ReactiveFormsModule } from '@angular/forms';

import { ThemeModule } from '../@theme/theme.module';
import { AdminMenu } from '../admin/admin-menu';
import { AuthModule } from '../@auth/auth.module';
import { DeviceComponent } from './device/device.component';
import { SettingComponent } from './device/setting/setting.component';
import { UuidListComponent } from './device/uuid/uuid-list.component';
import { EmailComponent } from './email/email.component';
import { EmailSettingComponent } from './email/email-setting/email-setting.component';
import { EmailListComponent } from './email/email-list/email-list.component';
import { PasswordComponent } from './password/password.component';
import { PasswordSettingComponent } from './password/password-setting/password-setting.component';
import { PasswordEnableComponent } from './password/password-enable/password-enable.component';
import { PasswordAddComponent } from './password/password-add/password-add.component';
import { PasswordListComponent } from './password/password-list/password-list.component';
import { EmailAddComponent } from './email/email-add/email-add.component';

import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserCreateComponent } from './user/user-create/user-create.component';
import { UuidComponent } from './device/uuid/uuid.component';
import { UserComponent } from './user/user/user.component';
import { NgpImagePickerModule } from 'ngp-image-picker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ComponentsModule } from 'app/@components/components.module';
import { SessionListComponent } from './session/session-list/session-list.component';
import { DashboardListComponent } from './user/dashboard/dashboard-list/dashboard-list.component';
import { DashboardEditComponent } from './user/dashboard/dashboard-edit/dashboard-edit.component';
import { CompanyRoutingModule } from './company-routing.module';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { NoPermissionComponent } from './no-permission/no-permission.component';
import { PermissionListComponent } from './permission/permission-list/permission-list.component';
import { PermissionAssignComponent } from './permission/permission-assign/permission-assign.component';
import { RolesListComponent } from './permission/roles-list/roles-list.component';
import { RolesAddComponent } from './permission/roles-add/roles-add.component';

const materialModules = [
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatButtonModule,
  MatButtonToggleModule,
];

const PAGES_COMPONENTS = [
  DeviceComponent,
  SettingComponent,
  UuidListComponent,
  EmailComponent,
  EmailSettingComponent,
  EmailListComponent,
  PasswordComponent,
  PasswordSettingComponent,
  PasswordEnableComponent,
  PasswordAddComponent,
  PasswordListComponent,
  EmailAddComponent,
  UserListComponent,
  UserCreateComponent,
  UuidComponent,
  UserComponent,
  SessionListComponent,
  DashboardListComponent,
  DashboardEditComponent,
];

@NgModule({
  imports: [
    CompanyRoutingModule,
    ThemeModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbIconModule,
    ngFormsModule,
    NbMenuModule,
    Ng2SmartTableModule,
    ReactiveFormsModule,
    NgpImagePickerModule,
    ComponentsModule,
    AuthModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ...materialModules
  ],
  declarations: [
    ...PAGES_COMPONENTS,
    DashboardComponent,
    NoPermissionComponent,
    PermissionListComponent,
    PermissionAssignComponent,
    RolesListComponent,
    RolesAddComponent,
  ],
  providers: [
    AdminMenu,
  ],
})
export class CompanyModule {
}
