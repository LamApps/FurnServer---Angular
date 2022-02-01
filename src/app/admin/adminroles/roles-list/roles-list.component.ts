import { Component, OnInit, OnDestroy } from '@angular/core';
import { RolesService } from '../../../@core/@services/roles.service';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'] 
})
export class RolesListComponent implements OnInit {

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
		name: {
        title: 'Role',
      }
    }
  };

  source: DataSource;

  constructor(
    private rolesService: RolesService,
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
    this.source = this.rolesService.rolesDataSource;
  }

  createRoles() {
    this.router.navigate(['/admin/users/roles/create']);
  }

  onEdit($event: any) {
    const params = JSON.stringify({ rid: $event.data.id }) 
    this.router.navigate([`/admin/users/roles/edit`], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete role?') && $event.data.id) {
      this.rolesService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Role deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Role wrong.');
          }
        });
    }
  }
}
