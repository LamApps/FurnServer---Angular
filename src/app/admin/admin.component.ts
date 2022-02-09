import { Component, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { NbMenuItem } from '@nebular/theme';
import { AdminMenu } from './admin-menu';
import { CompanyService } from 'app/@core/@services/company.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['admin.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class AdminComponent implements OnDestroy {

  menu: NbMenuItem[] = [
    {
			title: 'Dashboard',
			icon: 'home-outline',
			link: '',
			home: true,
		},
  ];
  alive: boolean = true;

  constructor(private pagesMenu: AdminMenu,
    private companyService: CompanyService,
  ) {
    this.loadCompany();
  }

  loadCompany() {
    this.companyService.list().subscribe(
      companies => {
        this.initMenu(companies);
      }
    );
  }
  initMenu(companies: any[]) {
    this.pagesMenu.getMenu(companies)
      .pipe(takeWhile(() => this.alive))
      .subscribe(menu => {
        this.menu = menu;
      });
  }
  ngOnDestroy(): void {
    this.alive = false;
  }
}
