import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { EmailService } from '../../../@core/@services/email.service';
import { EMAIL_PATTERN } from '../../../@auth/components';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-email-add',
  templateUrl: './email-add.component.html',
  styleUrls: ['./email-add.component.scss']
})
export class EmailAddComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  company;

  constructor(
    private emailService: EmailService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control(''),
      email: this.formBuilder.control('', [Validators.pattern(EMAIL_PATTERN), Validators.required]),
      description: this.formBuilder.control('', [Validators.required]),
      store_location: this.formBuilder.control('', [Validators.required]),
      subject_line: this.formBuilder.control('', [Validators.required]),
      name_format: this.formBuilder.control('', [Validators.required]),
      body: this.formBuilder.control('', [Validators.required]),
      active: this.formBuilder.control(true),
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          const eid = data.eid
          if (cid) {
            this.company = cid;
            if (eid) {
              this.setViewMode(FormMode.EDIT)
              this.loadEmail(eid);
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
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Email";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Add Email";
    }
  }

  loadEmail(id: any) {
    this.emailService.get(id).subscribe(email => {
      this.formGroup.setValue({ 
        id: email.id,
        email: email.email,
        description: email.description,
        store_location: email.store_location,
        subject_line: email.subject_line,
        name_format: email.name_format,
        body: email.body,
        active: email.active
      });
    });
  }

  
  get email() { return this.formGroup.get('email'); }
  get description() { return this.formGroup.get('description'); }
  get store_location() { return this.formGroup.get('store_location'); }
  get subject_line() { return this.formGroup.get('subject_line'); }
  get name_format() { return this.formGroup.get('name_format'); }
  get body() { return this.formGroup.get('body'); }

  submit(): void {
    const email = { ...this.formGroup.value, company: this.company };
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.emailService.add(email).subscribe(
        data => {
          this.toasterService.success('', 'Email created!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error);
          this.submitted = false;
        }
      );  
    } else {
      this.emailService.update(email).subscribe(
        data => {
          this.toasterService.success('', 'Email updated!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate([`/company/dashboard`]);
  }
}
