import { P } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { COSMIC_THEME, NbToastrService } from '@nebular/theme';
import { DATABASE_PATTERN } from '../../../@auth/components';
import { Company } from '../../../@core/@models/company';
import { CompanyService } from '../../../@core/@services/company.service';
import { MenuService } from '../../../@core/@services/menu.service';

@Component({
  selector: 'ngx-permission-assign',
  templateUrl: './permission-assign.component.html',
  styleUrls: ['./permission-assign.component.scss']
})
export class PermissionAssignComponent implements OnInit {
  submitted: boolean = false;

  companyList = [];
  selected_company;

  menuList = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private menuService: MenuService,
    private toasterService: NbToastrService,
  ) { }

  ngOnInit(): void {
    this.loadMenuList();
    this.loadCompanyList();
  }

  loadCompanyList() { 
    this.companyService.list().subscribe(
      data => {
        data.map(item=> {
          this.companyList.push(item);
        });
        this.selected_company = this.companyList[0].id;
        this.getPermission(this.selected_company);
      }
    );
  }

  loadMenuList() {
    this.menuService.list().subscribe(
      data => {
        data.map(item=> {
          this.menuList.push(item);
        });
        this.menuList.sort((a, b) => {
          return a.link.localeCompare(b.link)
        })
        if (this.companyList.length > 0) {
          this.getPermission(this.selected_company);
        }
      }
    )
  }

  getPermission(cid) {
    if (this.menuList.length == 0) return;
    if (this.companyList.length == 0) return;
    let id = 0;
    for (let i = 0; i < this.companyList.length; i++) {
      if (this.companyList[i].id == cid) {
        id = i;
        break;
      }
    }
    var companyMenuList = [];
    this.menuList.forEach(menu => {
      var exist = false;
      var company_menu;
      for (let i = 0; i < this.companyList[id].menus.length; i++) {
        if (menu.id == this.companyList[id].menus[i].menu.id) {
          exist = true;
          company_menu = this.companyList[id].menus[i];
        }
      }
      if (exist) {
        companyMenuList.push({...menu, permission: company_menu.permission});
      } else {
        companyMenuList.push({...menu, permission: 'view'})
      }
    })
    this.menuList = companyMenuList;
  }

  onChangeCompany($event) {
    this.selected_company = $event;
    this.getPermission(this.selected_company);
  }

  onPermisionChange(menu, permission) {
    for (let i = 0; i < this.menuList.length; i++) {
      if (this.menuList[i].id == menu.id) {
        this.menuList[i].permission = permission;
      }
    }
    this.all_permission = "";
  }

  all_permission = "";
  onClickAll(permission) {
    this.all_permission = permission;
    for (let i = 0; i < this.menuList.length; i++) {
      this.menuList[i].permission = permission;
    }
  }

  submit() {
    this.submitted = true;
    this.companyService.permission(this.selected_company, this.menuList).subscribe( 
      data=> {
        this.toasterService.success('', 'changed!');
        this.submitted = false;
        this.router.navigate([`/admin/dashboard`]);
      }, 
      error => {
        this.toasterService.danger('', error);
        this.submitted = false;
      }
    );
  }

  cancel() {
    this.router.navigate([`/admin/dashboard`]);
  }
}
