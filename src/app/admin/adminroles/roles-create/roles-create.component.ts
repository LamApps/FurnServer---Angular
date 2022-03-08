import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '../../../@core/@services/roles.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
} 

@Component({
  selector: 'ngx-roles-create',
  templateUrl: './roles-create.component.html',
  styleUrls: ['./roles-create.component.scss']
})
export class RolesCreateComponent implements OnInit {

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
      name: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)])
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const rid = data.rid
          if (rid) {
            this.setViewMode(FormMode.EDIT);
            this.loadRoles(rid);
          } else {
            this.setViewMode(FormMode.ADD);
          }
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
      }
    });
  }

  get name() { return this.formGroup.get('name'); }
  get code() { return this.formGroup.get('code'); }
  get description() { return this.formGroup.get('description'); }

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

  loadRoles(id: any) {
    this.rolesService.get(id).subscribe(roles => {
      this.formGroup.setValue({ 
        id: roles.id,
        name: roles.name
      });
    });
  }

  submit(): void {
    const roles = this.formGroup.value;
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.rolesService.add(roles).subscribe(
        data => {
          this.toasterService.success('', 'Role created!');
          this.submitted = false;
          this.router.navigate(['/admin/users/roles']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.rolesService.update(roles).subscribe(
        data => {
          this.toasterService.success('', 'Role updated!');
          this.submitted = false;
          this.router.navigate(['/admin/users/roles']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/users/roles']);
  }
}
