import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { NbToastrService } from '@nebular/theme';
import { UserService } from 'app/@core/@services/user.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ngx-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
  private alive = true;
  private company;

  settings = {
    mode: 'external',
    actions: {
      add: false,
      delete: false,
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    columns: {
      username: {
        title: 'Username',
      },
      company: {
        title: 'Company Code',
        valuePrepareFunction : (company) => {
          return company.code;
        },
        filter: false
      },
      'employee': {
        title: 'Employee',
        valuePrepareFunction : (cell, row) => {
          return row.firstname + ' ' + row.lastname;
        }
      },
      // 'dashboard_url': {
      //   title: 'Dashboard URL',
      //   valuePrepareFunction : (cell, row) => {
      //     return `http://newfurnserve.com/company/${row.company.id}/users/dashboard/${row.id}`;
      //   },
      //   filter: false
      // },
    }
  };

  source: DataSource;

  constructor(
    private userService: UserService,
    private router: Router, 
    private route: ActivatedRoute,
    private toastrService: NbToastrService) { 
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: this.company, did:  $event.data.id })
    this.router.navigate(['/company/users/dashboard/edit'], { queryParams: { data: encodeURI(params) }});
  }

  ngOnInit(): void {
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

  loadData() {
    this.source = this.userService.usersLimitedDataSource(this.company);
  }
}
