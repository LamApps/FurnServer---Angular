import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../@core/@services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from 'app/@core/@services/authentication.service';

@Component({
  selector: 'ngx-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
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
      username: {
        title: 'Username',
      },
      employee: {
        title: 'Employee',
      },
      company: {
        title: 'Company Code',
        valuePrepareFunction : (company) => {
          return company.code;
        },
        filter: false
      },
      database: {
        title: 'Database',
      },
      default_database: {
        title: 'Default Database'
      },
      timeout: {
        title: 'User Timeout'
      },
      role: {
        title: 'Role',
      },
      active: {
        title: 'Active',
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: true, title: 'true' },
              { value: false, title: 'false' },
            ],
          },
        },
      },
    }
  };

  source;

  constructor(
    private userService: UserService,
    private authService: AuthenticationService,
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
            this.loadLimitedData()
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

  loadData() {
  }

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "users/list") {
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

  loadLimitedData() {
    this.userService.list_company(this.company).subscribe((result) => {
      this.source = [];
      for (let i = 0; i < result.length; i++) {
        const hour = Math.floor(parseInt(result[i].timeout) / 60);
        const minute = parseInt(result[i].timeout) % 60;
        const timeout = hour.toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false
                        }) + " Hr(s) : " + minute.toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false
                        }) + " Min(s)"
        this.source.push({
          ...result[i],
          role: result[i].role ? result[i].role.name : 'Custom',
          employee: result[i].firstname + " " + result[i].lastname,
          timeout: result[i].timeout == 0 ? '' : timeout
        })
      }
      this.source.sort((a, b) => (a.employee > b.employee ? 1 : (a.employee < b.employee) ? -1 : 0 ));
    })
  }

  createUser() {
    const params = JSON.stringify({ cid: this.company }) 
    this.router.navigate(['/company/users/create'], { queryParams: { data: encodeURI(params) }});
  }

  onEdit($event: any) {
    if ($event.data.id == this.authService.currentUserValue.id) {
      this.router.navigate([`/company/users/current`]);
    } else {
      const params = JSON.stringify({ cid: this.company, uid:  $event.data.id })
      this.router.navigate(['/company/users/edit'], { queryParams: { data: encodeURI(params) }});
    }
  }

  onDelete($event: any) {
    if ($event.data.id == this.authService.currentUserValue.id) {
      this.toastrService.danger('', 'Can not delete yourself.');
      return;
    }
    if (confirm('Are you sure wants to delete user?') && $event.data.id) {
      this.userService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'User deleted!');
            this.loadLimitedData();
          } else {
            this.toastrService.danger('', 'Something wrong.');
          }
        });
    }
  }
}
