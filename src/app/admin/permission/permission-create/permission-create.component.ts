import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../../@core/@services/company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { MenuService } from '../../../@core/@services/menu.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-permission-create',
  templateUrl: './permission-create.component.html',
  styleUrls: ['./permission-create.component.scss']
})
export class PermissionCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;

  constructor(
    private menuService: MenuService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      link: this.formBuilder.control('', [Validators.required]),
      description: this.formBuilder.control('', []),
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const mid = data.mid
          if (mid) {
            this.setViewMode(FormMode.EDIT);
            this.loadMenu(mid);
          }
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
      } else {
        this.setViewMode(FormMode.ADD);
      }
    });
  }

  get link() { return this.formGroup.get('link'); }
  get description() { return this.formGroup.get('description'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Permission";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Permission";
    }
  }

  loadMenu(id: any) {
    this.menuService.get(id).subscribe(menu => {
      this.formGroup.setValue({ 
        id: menu.id,
        link: menu.link,
        description: menu.description
      });
    });
  } 

  submit(): void {
    const menu = this.formGroup.value;
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.menuService.add(menu).subscribe(
        data => {
          this.toasterService.success('', 'Permission created!');
          this.submitted = false;
          this.router.navigate(['/admin/permissions']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.menuService.update(menu).subscribe(
        data => {
          this.toasterService.success('', 'Permission updated!');
          this.submitted = false;
          this.router.navigate(['/admin/permissions']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/permissions']);
  }
}
