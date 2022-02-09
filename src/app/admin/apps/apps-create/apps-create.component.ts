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
  
  selectedCompany;
  
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
      app_id: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      expire_date: this.formBuilder.control(''),
      menu_password: this.formBuilder.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]),
      first_time_status: this.formBuilder.control(false),
      active: this.formBuilder.control(true),
    });
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const rid = data.id
          if (rid) {
            this.setViewMode(FormMode.EDIT);
            this.loadApps(rid);
          } else {
            this.setViewMode(FormMode.ADD);
          }
        } catch (e) {
          this.router.navigate(['/admin/apps/invoice/companies/list']);
        }
      }else{
        this.setViewMode(FormMode.ADD);
      }
    });

    this.loadCompanyList();
  }

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
        app_id: apps.app_id,
        expire_date: new Date(apps.expire_date),
        first_time_status: apps.first_time_status,
        menu_password: apps.menu_password,
        companies: apps.companies.id,
        active: apps.active
      });
    });
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
          this.router.navigate(['/admin/apps/invoice/companies/list/']);
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
          this.router.navigate(['/admin/apps/invoice/companies/list/']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/apps/invoice/companies/list/']);
  }
}
