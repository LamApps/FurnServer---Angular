import { Component, OnInit, OnDestroy } from '@angular/core';
import { PasswordService } from '../../../@core/@services/password.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-passwords-list',
  templateUrl: './passwords-list.component.html',
  styleUrls: ['./passwords-list.component.scss']
})
export class PasswordsListComponent implements OnInit {

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
        title: 'Id',
      },
      code: {
        title: 'Code',
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
    private passwordService: PasswordService,
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
    this.passwordService.list().subscribe((result) => {
      this.source = result
    })
  }

  createUser() {
    this.router.navigate(['/admin/apps/invoice/password/create']);
  }

  onEdit($event: any) {
    const params = JSON.stringify({ pid: $event.data.id }) 
    this.router.navigate(['/admin/apps/invoice/password/edit'], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete password?') && $event.data.id) {
      this.passwordService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Password deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Password wrong.');
          }
        });
    }
  }
}
