import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompanyService } from '../../../../../@core/@services/company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from '../../../../../@core/@services/authentication.service';
import { LocationService } from '../../../../../@core/@services/location.service';

@Component({
  selector: 'ngx-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {
  private alive = true;
  private company;
  private permission;

  settings = {
    mode: 'external',
    actions: {
      add: false,
      edit: false,
      delete: false,
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
      location: {
        title: "ID"
      },
      database: {
        title: 'Database',
      },
      name: {
        title: 'Name',
      },
      address: {
        title: 'Address'
      },
      city: {
        title: 'City'
      },
      state: {
        title: 'State'
      },
      zip: {
        title: 'Zip'
      },
    }
  };

  source;

  constructor(
    private companyService: CompanyService, 
    private authService: AuthenticationService,
    private locationService: LocationService,
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
        if (menu.menu.link == "furnserve/configurator/company") {
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
    console.log(this.company)
    this.locationService.list(this.company).subscribe((result) => {
      this.source = result;
    })
  }

  createUser() {
    const params = JSON.stringify({ cid: this.company }) 
    this.router.navigate(['/company/furnserve/configurator/company/create'], { queryParams: { data: encodeURI(params) }});
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: this.company, id: $event.data.id }) 
    this.router.navigate(['/company/furnserve/configurator/company/create'], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete company?') && $event.data.id) {
      this.locationService
        .delete($event.data.id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Company deleted!');
            this.loadData();
          } else {
            this.toastrService.danger('', 'Something wrong.');
          }
        });
    }
  }
}
