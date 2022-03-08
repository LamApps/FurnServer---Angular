/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './@core/@helpers/auth.guard';

const routes: Routes = [
  // {
  //   path: 'pages',
  //   loadChildren: () => import('app/pages/pages.module')
  //     .then(m => m.PagesModule),
  // },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('../app/admin/admin.module')
      .then(m => m.AdminModule),
  },
  {
    path: 'company',
    canActivate: [AuthGuard],
    loadChildren: () => import('../app/company/company.module')
      .then(m => m.CompanyModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('../app/@auth/auth.module')
      .then(m => m.AuthModule),
  },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [
    RouterModule.forRoot(routes, config)
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
