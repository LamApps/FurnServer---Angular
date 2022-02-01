import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminuserService } from '../../../@core/@services/adminuser.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from 'app/@core/@services/authentication.service';

@Component({
  selector: 'ngx-user-list',
  templateUrl: './adminuser-list.component.html',
  styleUrls: ['./adminuser-list.component.scss']
})
export class AdminuserListComponent implements OnInit, OnDestroy {
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
      username: {
        title: 'Username',
      },
      email: {
        title: 'Email',
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
      roles: {
        title: 'Role',
        valuePrepareFunction : (roles) => {
          return roles.name;
        },
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 'admin', title: 'Admin' },
              { value: 'user', title: 'User' },
            ],
          },
        },
        width: '120px',
        filterFunction(cell?: any, search?: string): boolean {
          let name: string = cell.name;
          if (name.toLowerCase().includes(search.toLowerCase())) return true;
          return false;
        }
      },
    }
  };

 

  source;

  constructor(
    private userService: AdminuserService,
    private authService: AuthenticationService,
    private router: Router, 
    private toastrService: NbToastrService) { 
    this.loadData();
  }

  ngOnInit(): void {
  }
  
  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.alive = false;
  }

  loadData() {
    this.userService.list().subscribe((result) => {
      this.source = result
      this.source.sort((a, b) => (a.username > b.username ? 1 : (a.username < b.username) ? -1 : 0 ));
    })
  }

  createUser() {
    this.router.navigate(['/admin/users/create/']);
  }

  onEdit($event: any) {
    this.router.navigate([`/admin/users/edit/${$event.data.id}`]);
    if ($event.data.id == this.authService.currentUserValue.id) {
      this.router.navigate([`/admin/users/current`]);
    } else {
      const params = JSON.stringify({ uid: $event.data.id }) 
      this.router.navigate(['/admin/users/edit'], { queryParams: { data: encodeURI(params) }});
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
            this.loadData();
          } else {
            this.toastrService.danger('', 'Something wrong.');
          }
        });
    }
  }
} 
