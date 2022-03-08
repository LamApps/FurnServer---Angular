import { Component } from '@angular/core';
import { UUIDService } from '../../../@core/@services/uuid.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { DatePipe } from '@angular/common';
import { AuthenticationService } from '../../../@core/@services/authentication.service';

@Component({
  selector: 'ngx-uuid',
  templateUrl: './uuid-list.component.html',
  styleUrls: ['./uuid-list.component.scss']
})
export class UuidListComponent {
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
      unique_id: {
        title: 'ID',
      },
      uuid: {
        title: 'UUID',
      },
      description: {
        title: 'Description',
      },
      last_date_verified: {
        title: 'Last Date Verified',
        valuePrepareFunction : (last_date_verified) => {
          return new Date(last_date_verified).toLocaleDateString();
        }
      },
      version: {
        title: 'Version',
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

  constructor(private uuidService: UUIDService,
    private authService: AuthenticationService,
    private router: Router, 
    private route: ActivatedRoute,
    private datePipe: DatePipe,
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
      } else {
        this.router.navigate(['/company/dashboard']);
      }
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "apps/invoice/devices/uuid") {
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

  loadData() {
    this.uuidService.list(this.company).subscribe((result) => {
      this.source = result.map(one => {
        return { ...one }
      })
    })
  }

  createUDID() {
    const params = JSON.stringify({ cid: this.company })
    this.router.navigate([`/company/apps/invoice/devices/create`], { queryParams : { data: encodeURI(params) } });
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: this.company, uid: $event.data.id })
    this.router.navigate([`/company/apps/invoice/devices/edit`], { queryParams : { data: encodeURI(params) } });
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete uuid?') && $event.data.id) {
      this.uuidService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'UUID deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Something wrong.');
          }
        });
    }
  }
}
