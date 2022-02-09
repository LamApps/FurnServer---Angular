/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AdminComponent } from '../admin/admin.component';
import { UuidListComponent } from './device/uuid/uuid-list.component';

import { PasswordEnableComponent } from './password/password-enable/password-enable.component';
import { PasswordAddComponent } from './password/password-add/password-add.component';
import { PasswordListComponent } from './password/password-list/password-list.component';
import { EmailAddComponent } from './email/email-add/email-add.component';
import { EmailListComponent } from './email/email-list/email-list.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserCreateComponent } from './user/user-create/user-create.component';
import { UuidComponent } from './device/uuid/uuid.component';
import { UserComponent } from './user/user/user.component';
import { SessionListComponent } from './session/session-list/session-list.component';
import { DashboardListComponent } from './user/dashboard/dashboard-list/dashboard-list.component';
import { DashboardEditComponent } from './user/dashboard/dashboard-edit/dashboard-edit.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { PermissionListComponent } from './permission/permission-list/permission-list.component';
import { PermissionAssignComponent } from './permission/permission-assign/permission-assign.component';
import { NoPermissionComponent } from './no-permission/no-permission.component';
import { RolesListComponent } from './permission/roles-list/roles-list.component';
import { RolesAddComponent } from './permission/roles-add/roles-add.component';
import { CodeListComponent } from './code/code-list/code-list.component'
import { CodeCreateComponent } from './code/code-create/code-create.component'

const routes: Routes = [{
  path: '',
  component: AdminComponent,
  children: [
    {
      path: 'dashboard',
      children: [
        {
          path: '',
          component: DashboardComponent,
        },
        {
          path: 'edit',
          component: DashboardEditComponent,
        }
      ]
    },
    {
      path: 'no-permission',
      component: NoPermissionComponent
    },
    {
      path: 'users',
      children: [
        {
          path: 'current',
          component: UserComponent,
        },
        {
          path: 'list',
          component: UserListComponent,
        },
        {
          path: 'create',
          component: UserCreateComponent,
        },
        {
          path: 'edit',
          component: UserCreateComponent,
        },
      ]
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'list',
          component: DashboardListComponent,
        },
        {
          path: 'edit',
          component: DashboardEditComponent,
        }    
      ]
    },
    {
      path: 'configuration',
      children: [
        {
          path: 'sessions',
          children: [
            {
              path: 'list',
              component: SessionListComponent
            }
          ]
        }
      ]
    },
    {
      path: 'permissions',
      children: [
        {
          path: 'list',
          component: PermissionListComponent
        },
        {
          path: 'assign',
          component: PermissionAssignComponent
        },
        {
          path: 'roles',
          children: [
            {
              path: '',
              component: RolesListComponent
            },
            {
              path: 'list',
              component: RolesListComponent
            },
            {
              path: 'create',
              component: RolesAddComponent
            },
            {
              path: 'edit',
              component: RolesAddComponent
            }
          ]
        },
        {
          path: 'roles-add'
        }
      ]
    },
    {
      path: 'apps',
      children: [
        {
          path: 'invoice',
          children: [
            {
              path: 'devices',
              children: [
                {
                  path: 'uuid',
                  component: UuidListComponent,
                },
                {
                  path: 'edit',
                  component: UuidComponent,
                },
                {
                  path: 'create',
                  component: UuidComponent,
                },
              ]
            },
            {
              path: 'email',
              children: [
                {
                  path: 'create',
                  component: EmailAddComponent,
                },
                {
                  path: 'edit',
                  component: EmailAddComponent,
                },
                {
                  path: 'list',
                  component: EmailListComponent,
                }
              ]
            },
            {
              path: 'password',
              children: [
                {
                  path: 'enable',
                  component: PasswordEnableComponent,
                },
                {
                  path: 'create',
                  component: PasswordAddComponent,
                },
                {
                  path: 'edit',
                  component: PasswordAddComponent,
                },
                {
                  path: 'list',
                  component: PasswordListComponent,
                }
              ]
            },
          ]
        }
      ]
    },
    {
      path: 'code',
      children: [
        {
          path: '',
          component: CodeListComponent
        },
        {
          path: 'list',
          component: CodeListComponent
        },
        {
          path: 'create',
          component: CodeCreateComponent
        },
        {
          path: 'edit',
          component: CodeCreateComponent
        }
      ]
    },
    { path: '', redirectTo: 'company', pathMatch: 'full' },
    {
      path: '**',
      component: DashboardComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRoutingModule {
}
