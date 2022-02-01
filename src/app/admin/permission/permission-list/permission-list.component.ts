import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { MenuService } from 'app/@core/@services/menu.service';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'ngx-permission',
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss']
})
export class PermissionListComponent implements OnInit {
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
      id: {
        title: "ID"
      },
      link: {
        title: 'Link',
      },
      description: {
        title: 'Description',
      },
    }
  };

  source;

  constructor(
    private menuService: MenuService, 
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
    this.menuService.list().subscribe((result) => {
      this.source = result
    })
  }

  onCreate() {
    this.router.navigate(['/admin/permissions/create']);
  }

  onEdit($event: any) {
    const params = JSON.stringify({ mid: $event.data.id }) 
    this.router.navigate(['/admin/permissions/edit'], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete permission?') && $event.data.id) {
      this.menuService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Permission deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Something wrong.');
          }
        });
    }
  }
}
