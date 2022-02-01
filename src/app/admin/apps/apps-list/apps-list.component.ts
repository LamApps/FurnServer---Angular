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
	  type: {
        title: 'Type',
      },
	  companies: {
        title: 'Company',
        valuePrepareFunction : (companies) => {
          return companies.name;
        }
      },
	  app_id: {
        title: 'App ID',
      },
	  expire_date: {
        title: 'Expire Date',
      },
	  first_time_status: {
        title: 'First Time',
      },
	  menu_password: {
        title: 'Password',
      },
	  active: {
        title: 'Active',
      }
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
    this.router.navigate(['/admin/apps/create/']);
  }

  onEdit($event: any) {
    this.router.navigate([`/admin/apps/edit/${$event.data.id}`]);
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
