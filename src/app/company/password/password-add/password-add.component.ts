import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CompanyService } from 'app/@core/@services/company.service';
import { CompanyPasswordService } from 'app/@core/@services/company-password.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-password-add',
  templateUrl: './password-add.component.html',
  styleUrls: ['./password-add.component.scss']
})
export class PasswordAddComponent implements OnInit {

  private company;
  formGroup: FormGroup;
  submitted: boolean = false;

  passwordList: any[] = [];

  constructor(private readonly themeService: NbThemeService,
    private passwordService: CompanyPasswordService,
    private companyService: CompanyService,
    private router: Router, 
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private formBuilder: FormBuilder
) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      description: this.formBuilder.control('', [Validators.required]),
      password: this.formBuilder.control('', [Validators.required]),
      code: this.formBuilder.control('', []),
      name: this.formBuilder.control('', []),
      pwd: this.formBuilder.control('', [Validators.required]),
      threshold: this.formBuilder.control('', []),
      has_threshold: this.formBuilder.control(false)
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          const pid = data.pid
          if (cid) {
            this.company = cid;
            this.loadData(cid);
            if (pid) {
              this.setViewMode(FormMode.EDIT)
              this.loadPassword(pid)
            } else {
              this.setViewMode(FormMode.ADD)
            }
          } else {
            this.cancel();
          }
        } catch (e) {
          this.cancel();
        }
      } else {
        this.cancel();
      }
    });
  }

  title: string;
  mode: FormMode;
  editing: boolean;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Add Password";
      this.editing = true;
    } else if (this.mode == FormMode.ADD) {
      this.title = "Update Password";
      this.editing = false;
    }
  }

  loadPassword(id: any): void {
    this.passwordService.get(id).subscribe(data => {
      this.formGroup.setValue({ 
        id: data.id,
        password: data.password.id,
        code: data.password.code,
        name: data.password.name,
        description: data.description,
        pwd: data.pwd,
        threshold: data.threshold,
        has_threshold: data.has_threshold,
      });
    });
  }

  loadData(company: any): void {
    this.companyService.get(company).subscribe(data => {
      data.enabled.forEach(enabled => {
        this.passwordList.push(enabled);
      })
    });
  }

  get description() { return this.formGroup.get('description'); }
  get pwd() { return this.formGroup.get('pwd'); }
  get code() { return this.formGroup.get('code'); }
  get name() { return this.formGroup.get('name'); }
  get threshold() { return this.formGroup.get('threshold'); }

  submit(): void {
    var password = this.formGroup.value;
    password.company = this.company;

    const threshold = password.threshold;
    if (!isNaN(Number(threshold))) {
      password = { ...password, threshold: Number(threshold)};
    } else {
      password = { ...password, threshold: 0 };
    }

    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.passwordService.add(password).subscribe(
        data => {
          this.toasterService.success('', 'Password created!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.passwordService.update(password).subscribe(
        data => {
          this.toasterService.success('', 'Password updated!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate([`/company/${this.company}/apps/invoice/password/list`], { queryParams : { company: this.company } });
  }
}
