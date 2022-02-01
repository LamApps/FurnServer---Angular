import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { PasswordService } from 'app/@core/@services/password.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.scss']
})
export class PasswordsComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;

  constructor(
    private passwordService: PasswordService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { 
    this.setViewMode(FormMode.ADD);
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      name: this.formBuilder.control('', [Validators.required]),
      code: this.formBuilder.control('', [Validators.required]),
      description: this.formBuilder.control('', []),
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const pid = data.pid
          if (pid) {
            this.setViewMode(FormMode.EDIT);
            this.loadPassword(pid);
          } 
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
      }
    });
  }

  get name() { return this.formGroup.get('name'); }
  get description() { return this.formGroup.get('description'); }
  get code() { return this.formGroup.get('code'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Password";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Password";
    }
  }

  loadPassword(id: any) {
    this.passwordService.get(id).subscribe(password => {
      this.formGroup.setValue({ 
        id: password.id,
        name: password.name,
        code: password.code,
        description: password.description,
      });
    });
  }

  submit(): void {
    const company = this.formGroup.value;
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.passwordService.add(company).subscribe(
        data => {
          this.toasterService.success('', 'Password created!');
          this.submitted = false;
          this.router.navigate(['/admin/apps/invoice/password']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.passwordService.update(company).subscribe(
        data => {
          this.toasterService.success('', 'Company updated!');
          this.submitted = false;
          this.router.navigate(['/admin/apps/invoice/password']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/apps/invoice/password']);
  }
}
