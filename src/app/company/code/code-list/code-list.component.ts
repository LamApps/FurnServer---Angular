import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from 'app/@core/@services/authentication.service';

import { CodeService } from '../../../@core/@services/code.service';


@Component({
  selector: 'ngx-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.scss']
})
export class CodeListComponent implements OnInit {
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
      description: {
        title: 'Description',
      },
      page: {
        title: 'Page',
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

  constructor(
    private codeService: CodeService,
    private authService: AuthenticationService,
    private router: Router, 
    private route: ActivatedRoute,
    private toastrService: NbToastrService
  ) { }

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
        if (menu.menu.link == "code") {
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
    this.codeService.list(this.company).subscribe((result) => {
      const data = result.map(code => {
        return {
          id: code.id,
          description: code.description,
          page: code.page,
          active: code.active
        }
      })
      this.source = data;
    })
  }

  createCode() {
    const params = JSON.stringify({ cid: this.company });
    this.router.navigate(['/company/code/create'], { queryParams: { data: encodeURI(params) }});
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: this.company, rid: $event.data.id }) 
    this.router.navigate([`/company/code/edit`], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure want to delete this code?') && $event.data.id) {
      this.codeService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Code deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Code wrong.');
          }
        });
    }
  }

}
