import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {  NbToastrService } from '@nebular/theme';
import { AuthenticationService } from '../../../@core/@services/authentication.service';
import { CompanyRoleService } from '../../../@core/@services/company-role.service';
import { CompanyService } from '../../../@core/@services/company.service';
import { MenuService } from '../../../@core/@services/menu.service';
import { UserService } from '../../../@core/@services/user.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-roles-add',
  templateUrl: './roles-add.component.html',
  styleUrls: ['./roles-add.component.scss']
})
export class RolesAddComponent implements OnInit {

  @ViewChild('name') name;
  @ViewChild('description') description;

  submitted: boolean = false;

  company;
  selected_user;

  companyMenuList = []
  menuList = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private companyService: CompanyService,
    private companyRoleService: CompanyRoleService,
    private userService: UserService,
    private menuService: MenuService,
    private toasterService: NbToastrService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          if (cid) {
            this.company = cid;
            this.loadMenuList(cid);
            const rid = data.rid;
            if (rid) {
              this.setViewMode(FormMode.EDIT);
              this.loadRole(rid);
            } else {
              this.setViewMode(FormMode.ADD);
            }
          } else {
            this.router.navigate(['/company/dashboard']);
          }
        } catch (e) {
          this.router.navigate(['/company/dashboard']);
        }
      }
    });
  }

  title: string;
  mode: FormMode;
  editing: boolean;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Update Role";
      this.editing = true;
    } else if (this.mode == FormMode.ADD) {
      this.title = "Add Role";
      this.editing = false;
    }
  }

  role_id: string = "";
  role_name: string = "";
  role_description: string = "";
  role_menus = [];
  loadRole(rid) {
    this.companyRoleService.get(rid).subscribe(
      data => {
        this.role_id = data.id;
        this.role_name = data.name;
        this.role_description = data.description;
        this.role_menus = data.menus;
        this.loadRoleMenu();
      }
    )
  }

  loadMenuList(cid) {
    this.companyService.get(cid).subscribe(
      data => {
        data.menus.map(item=> {
          if (item.permission == 'none') return;
          this.companyMenuList.push({...item.menu, permission: item.permission});
        });
        this.companyMenuList.sort((a, b) => {
          return a.link.localeCompare(b.link)
        })
        this.companyMenuList.forEach(menu => {
          this.menuList.push({ ...menu, permission: 'none', company_permission: menu.permission })
        })
        this.loadRoleMenu();
      }
    )
  }

  loadRoleMenu() {
    if (this.menuList.length == 0) return;
    if (this.role_menus.length == 0) return;
    for (let i = 0; i < this.menuList.length; i++) {
      const cmenu = this.menuList[i];
      let rmenu = undefined;
      for (let j = 0; j < this.role_menus.length; j++) {
        if (this.role_menus[j].menu.id == cmenu.id) {
          rmenu = this.role_menus[j];
        }
      }
      if (rmenu) {
        this.menuList[i] = { ...this.menuList[i], permission: rmenu.permission, rid: rmenu.id }
      }
    }
    this.checkCompanyPermission();
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
    this.checkCompanyPermission();
  }

  checkCompanyPermission() {
    for (let i = 0; i < this.menuList.length; i++) {
      if (this.menuList[i].company_permission == 'none') {
        this.menuList[i].permission = 'none';
      } else if (this.menuList[i].company_permission == 'view') {
        if (this.menuList[i].permission == 'read' || this.menuList[i].permission == 'write') {
          this.menuList[i].permission = 'view';
        }
      } else if (this.menuList[i].company_permission == 'read') {
        if (this.menuList[i].permission == 'write') {
          this.menuList[i].permission = 'read';
        }
      }
    }
  }

  submit() {
    const name = this.name.nativeElement.value;
    const description = this.description.nativeElement.value;
    const request = {
      id: this.role_id,
      company_id: this.company,
      name: name,
      description: description,
      menus: this.menuList
    }
    this.submitted = true;
    if (!this.editing) {
      this.companyRoleService.add(request).subscribe(
        data => {
          this.submitted = false
          this.toasterService.success('', 'Successfully added!');
          const params = JSON.stringify({ cid: this.company });
          this.router.navigate([`/company/permissions/roles/list`], { queryParams: { data: encodeURI(params) }});
        },
        error => {
          this.submitted = false
          this.toasterService.danger('', error.message);
        }
      )  
    } else {
      this.companyRoleService.update(request).subscribe(
        data => {
          this.submitted = false
          this.toasterService.success('', 'Successfully edited!');
          const params = JSON.stringify({ cid: this.company });
          this.router.navigate([`/company/permissions/roles/list`], { queryParams: { data: encodeURI(params) }});
        },
        error => {
          this.submitted = false
          this.toasterService.danger('', error.message);
        }
      )
    }
  }

  cancel() {
    const params = JSON.stringify({ cid: this.company });
    this.router.navigate([`/company/permissions/roles/list`], { queryParams: { data: encodeURI(params) }});
  }
}
