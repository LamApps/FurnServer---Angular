import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { RolesService } from '../../../@core/@services/roles.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;

  constructor(
    private rolesService: RolesService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      name: this.formBuilder.control('', [Validators.required]),
      code: this.formBuilder.control('', [Validators.required]),
      description: this.formBuilder.control('', []),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.setViewMode(FormMode.EDIT);
      this.loadPassword(id);
    } else {
      this.setViewMode(FormMode.ADD);
    }
  }

  get name() { return this.formGroup.get('name'); }
  get description() { return this.formGroup.get('description'); }
  get code() { return this.formGroup.get('code'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Roles";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Roles";
    }
  }

  loadPassword(id: any) {
    this.rolesService.get(id).subscribe(password => {
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
      this.rolesService.add(company).subscribe(
        data => {
          this.toasterService.success('', 'Role created!');
          this.submitted = false;
          this.router.navigate(['/admin/roles/list/']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.rolesService.update(company).subscribe(
        data => {
          this.toasterService.success('', 'Role updated!');
          this.submitted = false;
          this.router.navigate(['/admin/roles/list/']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/roles/list/']);
  }
}
