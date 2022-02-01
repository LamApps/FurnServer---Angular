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

import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ThemeModule } from '../@theme/theme.module';
import { AdminMenu } from './admin-menu';
import { AuthModule } from '../@auth/auth.module';

import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CompanyListComponent } from './company/company-list/company-list.component';
import { CompanyCreateComponent } from './company/company-create/company-create.component';
import { PasswordsListComponent } from './passwords/passwords-list/passwords-list.component';
import { PasswordsComponent } from './passwords/passwords/passwords.component';
import { AdminuserComponent } from './adminuser/adminuser/adminuser.component';
import { AdminuserListComponent } from './adminuser/adminuser-list/adminuser-list.component';
import { AdminuserCreateComponent } from './adminuser/adminuser-create/adminuser-create.component';

import { AppsListComponent } from './apps/apps-list/apps-list.component';
import { AppsCreateComponent } from './apps/apps-create/apps-create.component';  

import { RolesComponent } from './adminroles/roles/roles.component';
import { RolesListComponent } from './adminroles/roles-list/roles-list.component';
import { RolesCreateComponent } from './adminroles/roles-create/roles-create.component';

import { NgpImagePickerModule } from 'ngp-image-picker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ComponentsModule } from 'app/@components/components.module';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { PermissionListComponent } from './permission/permission-list/permission-list.component';
import { PermissionCreateComponent } from './permission/permission-create/permission-create.component';
import { PermissionAssignComponent } from './permission/permission-assign/permission-assign.component';
import { UtilsComponent } from './utils/utils.component';
import { BackupComponent } from './utils/backup/backup.component';

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
  AdminComponent,
  CompanyListComponent,
  CompanyCreateComponent,
  PasswordsListComponent,
  PasswordsComponent,
  AdminuserComponent,
  AdminuserListComponent,
  AdminuserCreateComponent,
  RolesComponent,
  RolesListComponent,
  RolesCreateComponent,
  AppsListComponent,
  AppsCreateComponent,
];

@NgModule({
  imports: [
    AdminRoutingModule,
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
    PermissionListComponent,
    PermissionCreateComponent,
    PermissionAssignComponent,
    UtilsComponent,
    BackupComponent,
  ],
  providers: [
    AdminMenu,
  ],
})
export class AdminModule {
}
