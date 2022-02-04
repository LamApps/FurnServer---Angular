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

  private company;
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
    
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const rid = data.rid
          const cid = data.cid
          this.company = cid
          if (rid) {
            this.setViewMode(FormMode.EDIT);
            this.loadCode(rid);
          } else {
            this.setViewMode(FormMode.ADD);
          }
          this.formGroup = this.formBuilder.group({
            id: this.formBuilder.control('', []),
            description: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
            company: this.formBuilder.control(cid, []),
            content: this.formBuilder.control('', [Validators.required, Validators.minLength(3)]),
            page: this.formBuilder.control('All', []),
            active: this.formBuilder.control(true),
          });
        } catch (e) {
          this.router.navigate(['/company/code']);
        }
      }else{
        this.setViewMode(FormMode.ADD);
      }
    });
  }

  get description() { return this.formGroup.get('description'); }
  get content() { return this.formGroup.get('content'); }
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
      this.formGroup.setValue({ 
        id: item.id,
        description: item.description,
        content: item.content,
        page: item.page,
        active: item.active,
        company: item.company || this.company
      });
    });
  }

  submit(): void {
    const codes = this.formGroup.value;
    console.log(codes)
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.codeService.add(codes).subscribe(
        data => {
          this.toasterService.success('', 'Code created!');
          this.submitted = false;
          const params = JSON.stringify({ cid: this.company });
          this.router.navigate(['/company/code'], { queryParams: { data: encodeURI(params) }});
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
          const params = JSON.stringify({ cid: this.company });
          this.router.navigate(['/company/code'], { queryParams: { data: encodeURI(params) }});
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    const params = JSON.stringify({ cid: this.company });
    this.router.navigate(['/company/code'], { queryParams: { data: encodeURI(params) }});
  }

}