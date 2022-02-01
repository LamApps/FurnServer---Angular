import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from 'app/@core/@services/authentication.service';
import { CompanyService } from 'app/@core/@services/company.service';
import { CompanyRoleService } from 'app/@core/@services/company-role.service';

@Component({
  selector: 'ngx-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss']
})
export class RolesListComponent implements OnInit {
  private alive = true;
  private company;
  private permission = "view";

  settings = {
    mode: 'external',
    actions: {
      delete: false,
      add: false,
      edit: false,
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      id: {
        title: "ID"
      },
      name: {
        title: 'Name',
      },
      description: {
        title: 'Description',
      },
    }
  };

  source;

  constructor(
    private authService: AuthenticationService,
    private companyService: CompanyService,
    private companyRoleService: CompanyRoleService,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: NbToastrService) {
  }

  ngOnInit(): void {
    this.checkPermission();
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          if (cid) {
            this.company = cid;
            this.loadData();
          } else {
            this.router.navigate(['/company/dashboard']);
          }
        } catch (e) {
          this.router.navigate(['/company/dashboard']);
        }
      }
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "permissions/roles/list") {
          this.permission = menu.permission
        }
      }
      if (this.permission == "none") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "view") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "read") {
        this.settings = { ...this.settings, actions: { add: false, edit: false, delete: false }}
      } else {
        this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
      }
    }
  }

  loadData() {
    this.companyRoleService.getCompanyRoles(this.company).subscribe((result) => {
      const roles = [];
      result.forEach(role => {
        roles.push(role);
      })
      this.source = roles;
    })
  }

  onCreate() {
    const params = JSON.stringify({ cid: this.company })
    this.router.navigate([`/company/permissions/roles/create`], { queryParams : { data: encodeURI(params) } });
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: this.company, rid: $event.data.id })
    this.router.navigate([`/company/permissions/roles/edit`], { queryParams : { data: encodeURI(params) } });
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete role?') && $event.data.id) {
      this.companyRoleService
        .delete($event.data.id)
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Role deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Something went wrong.');
          }
        });
    }
  }
}
function takeWhile(arg0: () => boolean): import("rxjs").OperatorFunction<boolean, unknown> {
  throw new Error('Function not implemented.');
}

