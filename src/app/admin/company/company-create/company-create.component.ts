import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../../@core/@services/company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { createTimeoutValidator } from '../../../@theme/components';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-company-create',
  templateUrl: './company-create.component.html',
  styleUrls: ['./company-create.component.scss']
})
export class CompanyCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;

  constructor(
    private companyService: CompanyService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      number: this.formBuilder.control('', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]),
      name: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      code: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
      timeout: this.formBuilder.control('', [Validators.required, createTimeoutValidator()]),
      databases: this.formBuilder.control('', [Validators.required]),
      active: this.formBuilder.control(true),
    });

    this.setViewMode(FormMode.ADD);
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          if (cid) {
            this.setViewMode(FormMode.EDIT);
            this.loadCompany(cid);
          }
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
      }
    });
  }

  get number() { return this.formGroup.get('number'); }
  get name() { return this.formGroup.get('name'); }
  get code() { return this.formGroup.get('code'); }
  get timeout() { return this.formGroup.get('timeout'); }
  get databases() { return this.formGroup.get('databases'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Company";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Company";
    }
  }

  databaseInput() {
    let newValue = this.databases.value.replace(/[^,0-9]/g, '');
    newValue = newValue.replace(/,,+/g, ',');
    this.databases.setValue(newValue)
    this.databases.updateValueAndValidity()
    return true
  }

  loadCompany(id: any) {
    this.companyService.get(id).subscribe(company => {
      const hour = Math.floor(parseInt(company.timeout) / 60);
      const minute = parseInt(company.timeout) % 60;
      const timeout = hour.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                      }) + ":" + minute.toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false
                      })
      this.formGroup.setValue({ 
        id: company.id,
        number: company.number,
        name: company.name,
        code: company.code,
        timeout: timeout,
        active: company.active,
        databases: company.databases,
      });
    });
  } 

  submit(): void {
    const company = this.formGroup.value;
    const timeout = company.timeout.toString().split(":");
    if (timeout.length == 2) {
      company.timeout = parseInt(timeout[0]) * 60 + parseInt(timeout[1]);
    }
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.companyService.add(company).subscribe(
        data => {
          this.toasterService.success('', 'Company created!');
          this.submitted = false;
          this.router.navigate(['/admin/companies']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.companyService.update(company).subscribe(
        data => {
          this.toasterService.success('', 'Company updated!');
          this.submitted = false;
          this.router.navigate(['/admin/companies']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/companies']);
  }
}