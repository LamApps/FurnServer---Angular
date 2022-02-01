import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { UserService } from 'app/@core/@services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'app/@core/@services/authentication.service';

@Component({
  selector: 'ngx-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {
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
    sort: 'employee',
    columns: {
      username: {
        title: 'Username',
      },
      employee: {
        title: 'Employee',
      },
      last_login_date: {
        title: 'Last Login Date',
        filter: {
          type: 'daterange',
          config: {
            daterange: {
              format: 'mm/dd/yyyy',
            },
          }
        }
      },
      last_login_time: {
        title: 'Last Login Time',
      },
      operating_system: {
        title: 'Operating System',
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 'Windows', title: 'Windows' },
              { value: 'Mac', title: 'Mac' },
              { value: 'Linux', title: 'Linux' },
              { value: 'Android', title: 'Android' },
              { value: 'iOS', title: 'iOS' },
            ],
          },
        },
      },
      browser: {
        title: 'Browser',
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 'Chrome', title: 'Chrome' },
              { value: 'Safari', title: 'Safari' },
              { value: 'Firefox', title: 'Firefox' },
              { value: 'IE', title: 'IE' },
              { value: 'Opera', title: 'Opera' },
            ],
          },
        },
      },
      ip_address: {
        title: 'IP Address',
      },
      last_login_database: {
        title: 'Database'
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
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "configuration/sessions/list") {
          this.permission = menu.permission
        }
      }
      if (this.permission == "none") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "view") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "read") {
        // this.settings = { ...this.settings, actions: { add: false, edit: false, delete: false }}
      } else {
        // this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
      }
    }
  }


  loadData() {
    this.userService.list_company(this.company).subscribe((result) => {
      this.source = result.map(one => {
        return { ...one, employee: one.firstname + " " + one.lastname }
      }).sort((a, b) => {
        if (a.employee > b.employee) return 1
        if (a.employee < b.employee) return -1
        return 0
      })
    })
  }
}
