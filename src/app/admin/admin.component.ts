import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminMenu } from './admin-menu';
import { CompanyService } from '../../app/@core/@services/company.service';
import { AuthenticationService } from '../@core/@services/authentication.service';
import { SidebarService } from '../@core/@services/sidebar.service';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['admin.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit, OnDestroy {

  companies:any[] = [];
  currentCompany:number = 0;
  menu: NbMenuItem[] = [];
  alive: boolean = true;
  isAdmin: boolean = false;

  constructor(
    private pagesMenu: AdminMenu,
    private companyService: CompanyService,
    private authService: AuthenticationService,
    private router: Router,
    private sidebarService: SidebarService,
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.currentCompany = this.isAdmin?this.sidebarService.getData():this.authService.currentUserValue.company.id;
  }

  ngOnInit() {
    this.loadCompany();
  }

  loadCompany() {
    this.companyService.list().subscribe(
      companies => {
        const sortedCompanies = companies.sort(function(a, b){
          	let x = a.name.toLowerCase();
          	let y = b.name.toLowerCase();
          	if (x < y) {return -1;}
          	if (x > y) {return 1;}
          	return 0;
            });
        this.companies = [{id:0, name: 'Admin'}, ...sortedCompanies];
        this.initMenu(this.currentCompany, false)
      }
    );
  }
  initMenu(companyId:number, fromSelect: boolean) {

    let company = this.isAdmin?(companyId>0?this.companies.find(item=>item.id===companyId):{id:0, name: 'Admin'}):this.companies.find(item=>item.id===companyId);
    this.pagesMenu.getMenu(company)
    .subscribe(menu => {
      this.menu = menu;
      if(fromSelect){
        if(companyId>0) {
            const currentRoute = this.router.url=='/admin/dashboard'?'/company/dashboard':this.router.url.split('?')[0];  
            const params = JSON.stringify({ cid: companyId });
            this.router.navigate([currentRoute], { queryParams : { data: encodeURI(params) } });
          }else {
            this.router.navigate(['/admin/dashboard']);
          }
        }else{
          if(companyId==0) {
            if(this.isAdmin) this.router.navigate(['/admin/dashboard']);
            else this.router.navigate(['/company/dashboard']);
          }
        }
      });
    
  }
  changeCompany(event:any){
    this.currentCompany = event;
    this.sidebarService.setData(event);
    const company = this.companies.find(item=>item.id===event)
    this.initMenu(company.id, true);
  }
  ngOnDestroy(): void {
    this.alive = false;
  }
}
