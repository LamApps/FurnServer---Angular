import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from '../../../@core/@services/authentication.service';
import { CompanyService } from '../../../@core/@services/company.service';
import { MenuService } from '../../../@core/@services/menu.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'ngx-permission',
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss']
})
export class PermissionListComponent implements OnInit {
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
      link: {
        title: 'Link',
      },
      permission: {
        title: 'Permission'
      },
      description: {
        title: 'Description',
      },
    }
  };

  source;

  constructor(
    private menuService: MenuService,
    private authService: AuthenticationService,
    private companyService: CompanyService,
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
      this.settings = { ...this.settings, actions: { add: false, edit: false, delete: false }}
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "permissions/list") {
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
        this.settings = { ...this.settings, actions: { add: false, edit: false, delete: false }}
      }
    }
  }

  loadData() {
    this.companyService.get(this.company).subscribe((result) => {
      const menus = [];
      result.menus.forEach(menu => {
        if (menu.permission == 'none') return;
        menus.push({ ...menu.menu, permission: menu.permission });
      })
      this.source = menus;
    })
  }
}
