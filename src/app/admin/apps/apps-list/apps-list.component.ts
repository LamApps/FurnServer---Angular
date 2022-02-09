import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppsService } from '../../../@core/@services/apps.service';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-apps-list',
  templateUrl: './apps-list.component.html',
  styleUrls: ['./apps-list.component.scss'] 
})
export class AppsListComponent implements OnInit {

  private alive = true;

  settings = {
    mode: 'external',
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
	  // type: {
    //     title: 'Type',
    //   },
	  companies: {
        title: 'Name',
        valuePrepareFunction : (companies) => {
          return companies.name;
        }
      },
	  app_id: {
        title: 'App ID',
      },
	  expire_date: {
        title: 'Expire Date',
        valuePrepareFunction : (expire_date) => {
          return new Date(expire_date).toLocaleDateString();
        }
      },
	  first_time_status: {
        title: 'First Time',
      },
	  menu_password: {
        title: 'Menu Password',
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

  source: DataSource;

  constructor(
    private appsService: AppsService,
    private router: Router, 
    private toastrService: NbToastrService) { 
    this.loadData();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  loadData() {
    this.source = this.appsService.appsDataSource;  
  }

  createApps() {
    this.router.navigate(['/admin/apps/invoice/companies/create/']);
  }

  onEdit($event: any) {
    const params = JSON.stringify({ id: $event.data.id }) 
    this.router.navigate([`/admin/apps/invoice/companies/edit/`], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete app?') && $event.data.id) {
      this.appsService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'App deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'App wrong.');
          }
        });
    }
  }
}
