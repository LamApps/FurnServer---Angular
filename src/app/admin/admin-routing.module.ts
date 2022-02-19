/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AdminComponent } from './admin.component';

import { CompanyListComponent } from './company/company-list/company-list.component';
import { CompanyCreateComponent } from './company/company-create/company-create.component';
import { PasswordsListComponent } from './passwords/passwords-list/passwords-list.component';
import { PasswordsComponent } from './passwords/passwords/passwords.component';
import { AdminuserComponent } from './adminuser/adminuser/adminuser.component';
import { AdminuserListComponent } from './adminuser/adminuser-list/adminuser-list.component';
import { AdminuserCreateComponent } from './adminuser/adminuser-create/adminuser-create.component';
import { RolesListComponent } from './adminroles/roles-list/roles-list.component';
import { RolesCreateComponent } from './adminroles/roles-create/roles-create.component';
import { AppsListComponent } from './apps/apps-list/apps-list.component';
import { AppsCreateComponent } from './apps/apps-create/apps-create.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { PermissionListComponent } from './permission/permission-list/permission-list.component';
import { PermissionCreateComponent } from './permission/permission-create/permission-create.component';
import { PermissionAssignComponent } from './permission/permission-assign/permission-assign.component';
import { UtilsComponent } from './utils/utils.component';
import { BackupComponent } from './utils/backup/backup.component';
import { CodeListComponent } from './code/code-list/code-list.component';
import { CodeCreateComponent } from './code/code-create/code-create.component';
import { RoomsComponent } from './chat/rooms/rooms.component';
import { RoomCreateComponent } from './chat/rooms/room-create/room-create.component';
import { RoomChatComponent } from './chat/rooms/room-chat/room-chat.component';
import { PrivateChatComponent } from './chat/private/private-chat/private-chat.component';

const routes: Routes = [{
  path: '',
  component: AdminComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'users',
      children: [
        {
          path: 'list',
          component: AdminuserListComponent,
        },
        {
          path: 'current',
          component: AdminuserComponent,
        },
        {
          path: 'create',
          component: AdminuserCreateComponent,
        },
        {
          path: 'edit',
          component: AdminuserCreateComponent,
        },
        {
          path: 'roles',
          children: [
            {
              path: '',
              component: RolesListComponent,
            },
            {
              path: 'create',
              component: RolesCreateComponent,
            },
            {
              path: 'edit',
              component: RolesCreateComponent,
            }
          ]
        }, 
      ]
    }, 
    {
      path: 'companies',
      children: [
        {
          path: '',
          component: CompanyListComponent,
        },
        {
          path: 'create',
          component: CompanyCreateComponent,
        },
        {
          path: 'edit',
          component: CompanyCreateComponent,
        }
      ]
    },
    {
      path: 'permissions',
      children: [
        {
          path: '',
          component: PermissionListComponent
        },
        {
          path: 'create',
          component: PermissionCreateComponent
        },
        {
          path: 'edit',
          component: PermissionCreateComponent
        },
        {
          path: 'assign',
          component: PermissionAssignComponent
        }
      ]
    },
    {
      path: 'apps', 
      children: [
        {
          path: '',
          component: AppsListComponent,
        },
        {
          path: 'create',
          component: AppsCreateComponent,
        },
        {
          path: 'edit',
          component: AppsCreateComponent,
        },
        {
          path: 'invoice',
          children: [
            {
              path: 'companies',
              children : [
                { 
                  path: '',
                  component: AppsListComponent,
                },
                { 
                  path: 'list',
                  component: AppsListComponent,
                },
                {
                  path: 'create',
                  component: AppsCreateComponent,
                },
                {
                  path: 'edit',
                  component: AppsCreateComponent,
                }
              ]
            },
            {
              path: 'password',
              children: [
                {
                  path: '',
                  component: PasswordsListComponent,
                },
                {
                  path: 'create',
                  component: PasswordsComponent,
                },
                {
                  path: 'edit',
                  component: PasswordsComponent,
                }
              ]
            }
          ]
        }
      ]
    },
    {
      path: 'utilities', 
      children: [
        {
          path: '',
          component: UtilsComponent,
        },
        {
          path: 'backups',
          component: BackupComponent,
        },
      ]
    },
    {
      path: 'code', 
      children: [
        {
          path: '',
          component: CodeListComponent,
        },
        {
          path: 'list',
          component: CodeListComponent,
        },
        {
          path: 'create',
          component: CodeCreateComponent,
        },
        {
          path: 'edit',
          component: CodeCreateComponent,
        }
      ]
    },
    {
      path: 'chat', 
      children: [
        {
          path: 'rooms',
          children: [
            {
              path: '',
              component: RoomsComponent,
            },
            {
              path: 'list',
              component: RoomsComponent,
            },
            {
              path: 'create',
              component: RoomCreateComponent,
            },
            {
              path: 'edit',
              component: RoomCreateComponent,
            },
            {
              path: 'enter',
              component: RoomChatComponent,
            },
          ]
        },
        {
          path: 'conversations',
          children: [
            {
              path: '',
              component: PrivateChatComponent,
            },
            {
              path: 'list',
              component: PrivateChatComponent,
            },
          ]
        },
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
export class AdminRoutingModule {
}
