import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CodeService } from 'app/@core/@services/code.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
} 
@Component({
  selector: 'ngx-code-create',
  templateUrl: './code-create.component.html',
  styleUrls: ['./code-create.component.scss']
})
export class CodeCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  selectedItem = 'All';

  constructor(
    private codeService: CodeService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      description: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
      company: this.formBuilder.control(0, []),
      code: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
      page: this.formBuilder.control('All', []),
      active: this.formBuilder.control(true),
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const rid = data.rid
          if (rid) {
            this.setViewMode(FormMode.EDIT);
            this.loadCode(rid);
          } else {
            this.setViewMode(FormMode.ADD);
          }
        } catch (e) {
          this.router.navigate(['/admin/code']);
        }
      }else{
        this.setViewMode(FormMode.ADD);
      }
    });
  }

  get description() { return this.formGroup.get('description'); }
  get code() { return this.formGroup.get('code'); }
  get page() { return this.formGroup.get('page'); }
  get active() { return this.formGroup.get('active'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Codes";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Codes";
    }
  }

  loadCode(id: number) {
    this.codeService.getOne(id).subscribe(code => {
      const item = code.item;
      console.log(item)
      this.formGroup.setValue({ 
        id: item.id,
        description: item.description,
        code: item.content,
        page: item.page,
        active: item.active,
        company: item.company || 0
      });
    });
  }

  submit(): void {
    const codes = this.formGroup.value;
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.codeService.add(codes).subscribe(
        data => {
          this.toasterService.success('', 'Code created!');
          this.submitted = false;
          this.router.navigate(['/admin/code']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.codeService.update(codes).subscribe(
        data => {
          this.toasterService.success('', 'Code updated!');
          this.submitted = false;
          this.router.navigate(['/admin/code']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/code']);
  }

}
