import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmailService } from '../../../@core/@services/email.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from 'app/@core/@services/authentication.service';

@Component({
  selector: 'ngx-email-list',
  templateUrl: './email-list.component.html',
  styleUrls: ['./email-list.component.scss']
})
export class EmailListComponent implements OnInit {
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
      id: {
        title: 'ID',
      },
      email: {
        title: 'Email Address',
      },
      description: {
        title: 'Description',
      },
      store_location: {
        title: 'Store Location',
      },
      subject_line: {
        title: 'Subject Line',
      },
    }
  };

  source;

  constructor(
    private emailService: EmailService,
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
      const menus = user.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "apps/invoice/email/list") {
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
    this.emailService.list(this.company).subscribe((result) => {
      this.source = result
    })
  }

  createEmail() {
    const params = JSON.stringify({ cid: this.company })
    this.router.navigate([`/company/apps/invoice/email/create`], { queryParams : { data: encodeURI(params) } });
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: this.company, eid: $event.data.id })
    this.router.navigate([`/company/apps/invoice/email/edit`], { queryParams : { data: encodeURI(params) } });
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete email?') && $event.data.id) {
      this.emailService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Email deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Email wrong.');
          }
        });
    }
  }

}
