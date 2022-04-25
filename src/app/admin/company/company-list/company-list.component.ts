import { Component, OnInit, OnDestroy } from '@angular/core';
import { CompanyService } from '../../../@core/@services/company.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnInit {
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
      number: {
        title: "ID"
      },
      name: {
        title: 'Name',
      },
      code: {
        title: 'Code',
      },
      timeout: {
        title: 'Company Timeout'
      },
      databases: {
        title: 'Databases'
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
    private companyService: CompanyService, 
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
    this.companyService.list().subscribe((result) => {
      this.source = [];
      for (let i = 0; i < result.length; i++) {
        const hour = Math.floor(parseInt(result[i].timeout) / 60);
        const minute = parseInt(result[i].timeout) % 60;
        const timeout = hour.toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false
                        }) + " Hr(s) : " + minute.toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false
                        }) + " Min(s)"
        this.source.push({
          ...result[i],
          timeout: timeout
        })
      }
    })
  }

  createUser() {
    this.router.navigate(['/admin/companies/create']);
  }

  onEdit($event: any) {
    const params = JSON.stringify({ cid: $event.data.id }) 
    this.router.navigate(['/admin/companies/edit'], { queryParams: { data: encodeURI(params) }});
  }

  onDelete($event: any) {
    if (confirm('Are you sure wants to delete company?') && $event.data.id) {
      this.companyService
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
