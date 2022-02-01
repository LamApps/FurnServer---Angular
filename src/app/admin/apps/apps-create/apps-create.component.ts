import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppsService } from 'app/@core/@services/apps.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CompanyService } from '../../../@core/@services/company.service';
import { Company } from '../../../@core/@models/company';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
} 

@Component({
  selector: 'ngx-apps-create',
  templateUrl: './apps-create.component.html',
  styleUrls: ['./apps-create.component.scss']
})
export class AppsCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;

  companyList: Company[] = [];
  
  
  constructor(
    private appsService: AppsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private companyService: CompanyService,
    private toasterService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      companies: this.formBuilder.control('', [Validators.required]),
      type: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      app_id: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      expire_date: this.formBuilder.control(''),
      menu_password: this.formBuilder.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]),
      first_time_status: this.formBuilder.control(false),
      active: this.formBuilder.control(true),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.setViewMode(FormMode.EDIT);
      this.loadApps(id);
    } else {
      this.setViewMode(FormMode.ADD);
    }
    this.loadCompanyList();
  }

  get type() { return this.formGroup.get('type'); }
  get app_id() { return this.formGroup.get('app_id'); }
  get expire_date() { return this.formGroup.get('expire_date'); }
  get first_time_status() { return this.formGroup.get('first_time_status'); }
  get menu_password() { return this.formGroup.get('menu_password'); }
  get active() { return this.formGroup.get('active'); }
  get companies() { return this.formGroup.get('companies'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit App";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create App";
    }
  }

  loadApps(id: any) {
    this.appsService.get(id).subscribe(apps => {
      this.formGroup.setValue({
        id: apps.id, 
        type: apps.type,
        app_id: apps.app_id,
        expire_date: apps.expire_date,
        first_time_status: apps.first_time_status,
        menu_password: apps.menu_password,
        companies: apps.companies.id,
        active: apps.active
      });
      this.onExpireDateChange();
    });
  }

  onExpireDateChange() {
    let newValue = this.expire_date.value.replace(/\D/g,'')
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2)
    }
    if (newValue.length >= 6) {
      newValue = newValue.slice(0, 5) + "/" + newValue.slice(5)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 10)
    }
    this.expire_date.setValue(newValue)
    this.expire_date.updateValueAndValidity()
    return true
  }
  
  loadCompanyList() { 
    this.companyService.list().subscribe(
      data => {
        data.map(item=> {
          this.companyList.push(item);
        });
      }
    );
  }

  submit(): void { 
    const apps = this.formGroup.value;
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.appsService.add(apps).subscribe(
        data => {
          this.toasterService.success('', 'App created!');
          this.submitted = false;
          this.router.navigate(['/admin/apps/list/']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.appsService.update(apps).subscribe(
        data => {
          this.toasterService.success('', 'App updated!');
          this.submitted = false;
          this.router.navigate(['/admin/apps/list/']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/apps/list/']);
  }
}
