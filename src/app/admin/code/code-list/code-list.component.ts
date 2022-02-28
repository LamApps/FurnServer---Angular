import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';

import { CodeService } from '../../../@core/@services/code.service';


@Component({
  selector: 'ngx-code-list',
  templateUrl: './code-list.component.html',
  styleUrls: ['./code-list.component.scss']
})
export class CodeListComponent implements OnInit {
  private alive: boolean = true;
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
    private router: Router, 
    private toastrService: NbToastrService,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  loadData() {
    this.codeService.list().subscribe((result) => {
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
    this.router.navigate(['/admin/code/create']);
  }

  onEdit($event: any) {
    const params = JSON.stringify({ rid: $event.data.id }) 
    this.router.navigate([`/admin/code/edit`], { queryParams: { data: encodeURI(params) }});
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
