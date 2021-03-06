import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {  NbToastrService } from '@nebular/theme';
import { AuthenticationService } from '../../../@core/@services/authentication.service';
import { CompanyRoleService } from '../../../@core/@services/company-role.service';
import { CompanyService } from '../../../@core/@services/company.service';
import { MenuService } from '../../../@core/@services/menu.service';
import { UserService } from '../../../@core/@services/user.service';

@Component({
  selector: 'ngx-permission-assign',
  templateUrl: './permission-assign.component.html',
  styleUrls: ['./permission-assign.component.scss']
})
export class PermissionAssignComponent implements OnInit {
  permission = "view";
  
  submitted: boolean = false;

  company;
  userList = [];
  selected_user;

  roleList = [];
  selected_role = -1;

  companyMenuList = []
  menuList = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private companyService: CompanyService,
    private userService: UserService,
    private companyRoleService: CompanyRoleService,
    private toasterService: NbToastrService,
  ) { }

  ngOnInit(): void {
    this.checkPermission();
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          if (cid) {
            this.company = cid;
            this.loadUserList();
            this.loadMenuList(cid);
            this.loadRoleList();
          } else {
            this.router.navigate(['/company/dashboard']);
          }
        } catch (e) {
          this.router.navigate(['/company/dashboard']);
        }
      }
    });
  }

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.permission = 'write'
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "permissions/assign") {
          this.permission = menu.permission
        }
      }
      if (this.permission == "none") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "view") {
        this.router.navigate(['/company/no-permission']);
      }
    }
  }

  loadUserList() { 
    this.userService.list_company(this.company).subscribe(
      data => {
        console.log(data)
        data.map(item=> {
          this.userList.push(item);
        });
        this.selected_user = this.userList[0].id;
        this.selected_role = this.userList[0].role?this.userList[0].role.id:0;
        
        this.getPermission(this.selected_user);
      }
    );
  }

  loadRoleList() {
    this.companyRoleService.getCompanyRoles(this.company).subscribe(
      data => {
        data.map(item => {
          this.roleList.push(item);
        });
        this.getPermission(this.selected_user);
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
        this.getPermission(this.selected_user);
      }
    )
  }

  getPermission(uid) {
    if (!this.companyMenuList || this.companyMenuList.length == 0) return;
    if (!this.userList || this.userList.length == 0) return;
    if (!this.roleList || this.roleList.length == 0) return;
    let rid = 0;
    for (let i = 0; i < this.userList.length; i++) {
      if (this.userList[i].id == uid) {
        rid = this.userList[i].role.id;
        break;
      }
    }
    // var userMenuList = [];
    // this.companyMenuList.forEach(menu => {
    //   var exist = false;
    //   var user_menu;
    //   for (let i = 0; i < this.userList[id].menus.length; i++) {
    //     if (menu.id == this.userList[id].menus[i].menu.id) {
    //       exist = true;
    //       user_menu = this.userList[id].menus[i];
    //     }
    //   }
    //   if (exist) {
    //     userMenuList.push({...menu, permission: user_menu.permission, company_permission: menu.permission});
    //   } else {
    //     userMenuList.push({...menu, permission: 'view', company_permission: menu.permission});
    //   }
    // })
    this.selected_role = rid;

    this.getRolePermission(rid);
    // this.menuList = userMenuList;
  }

  getRolePermission(rid) {
    let id = 0;
    for (let i = 0; i < this.roleList.length; i++) {
      if (this.roleList[i].id == rid) {
        id = i;
        break;
      }
    }
    var roleMenuList = []; 
    this.companyMenuList.forEach(menu => {
      var exist = false;
      var role_menu;
      for (let i = 0; i < this.roleList[id].menus.length; i++) {
        if (this.roleList[id].menus[i].menu.id == menu.id) {
          exist = true;
          role_menu = this.roleList[id].menus[i];
        }
      }
      if (exist) {
        roleMenuList.push({...menu, permission: role_menu.permission, company_permission: menu.permission});
      } else {
        roleMenuList.push({...menu, permission: 'view', company_permission: menu.permission});
      }
    })
    this.menuList = roleMenuList;
    this.checkCompanyPermission();
  }

  onChangeUser($event) {
    this.selected_user = $event;
    this.getPermission(this.selected_user);
    this.all_permission = "";
  }

  onChangeRole($event) {
    this.selected_role = $event;
    this.getRolePermission(this.selected_role);
    this.all_permission = "";
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
    this.submitted = true;
    this.userService.permission(this.selected_user, this.selected_role, this.menuList).subscribe( 
      data=> {
        console.log(data)
        const user = this.authService.currentUserValue
        if(user.id == data.user.item.id) this.authService.setUserValue(data.user.item)
        this.toasterService.success('', 'changed!');
        this.submitted = false;
        this.userList = [];
        this.roleList = [];
        this.companyMenuList = [];
        this.menuList = [];
        this.loadUserList();
        this.loadMenuList(this.company);
        this.loadRoleList();

      }, 
      error => {
        this.toasterService.danger('', error);
        this.submitted = false;
      }
    );
  }

  cancel() {
    const params = JSON.stringify({ cid: this.company });
    this.router.navigate([`/company/permissions/assign`], { queryParams: { data: encodeURI(params) }});
  }
}
