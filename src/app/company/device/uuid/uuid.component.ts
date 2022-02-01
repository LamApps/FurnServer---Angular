import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UUIDService } from 'app/@core/@services/uuid.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-uuid',
  templateUrl: './uuid.component.html',
  styleUrls: ['./uuid.component.scss']
})
export class UuidComponent implements OnInit {
  
  formGroup: FormGroup;
  submitted: boolean = false;
  company;

  constructor(
    private uuidService: UUIDService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { }

  get last_date_verified() { return this.formGroup.get('last_date_verified'); }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      uuid: this.formBuilder.control('', [Validators.required]),
      description: this.formBuilder.control('', ),
      version: this.formBuilder.control('', ),
      last_date_verified: this.formBuilder.control('', [Validators.required]),
      active: this.formBuilder.control(true),
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          const uid = data.uid
          if (cid) {
            this.company = cid;
            if (uid) {
              this.setViewMode(FormMode.EDIT)
              this.loadUuid(uid);
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
      this.title = "Edit UUID";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Add UUID";
    }
  }

  loadUuid(id: any) {
    this.uuidService.get(id).subscribe(uuid => {
      this.formGroup.setValue({ 
        id: uuid.id,
        uuid: uuid.uuid,
        description: uuid.description,
        version: uuid.version,
        last_date_verified: new Date(uuid.last_date_verified),
        active: uuid.active,
      });
      this.onLastDateChange();
    });
  }

  
  onLastDateChange() {
    let newValue = this.last_date_verified.value.replace(/\D/g,'')
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2)
    }
    if (newValue.length >= 6) {
      newValue = newValue.slice(0, 5) + "/" + newValue.slice(5)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 10)
    }
    this.last_date_verified.setValue(newValue)
    this.last_date_verified.updateValueAndValidity()
    return true
  }

  get uuid() { return this.formGroup.get('uuid'); }
  get description() { return this.formGroup.get('description'); }
  get version() { return this.formGroup.get('version'); }

  
  submit(): void {
    const uuid = { ...this.formGroup.value, company: this.company };
    uuid.last_date_verified = new Date(uuid.last_date_verified).toLocaleDateString();
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.uuidService.add(uuid).subscribe(
        data => {
          this.toasterService.success('', 'UUID created!');
          this.submitted = false;
          this.router.navigate([`/company/dashboard`]);
        },
        error => {
          this.toasterService.danger('', error);
          this.submitted = false;
        }
      );  
    } else {
      this.uuidService.update(uuid).subscribe(
        data => {
          this.toasterService.success('', 'UUID updated!');
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
