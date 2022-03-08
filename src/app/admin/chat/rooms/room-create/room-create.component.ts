import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { RoomsService } from '../../../../@core/@services/rooms.service'
import { CompanyService } from '../../../../@core/@services/company.service'
import { AuthenticationService } from '../../../../@core/@services/authentication.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
} 

@Component({
  selector: 'ngx-room-create',
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss']
})
export class RoomCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  adminFlag: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private roomsService: RoomsService,
    private companyService: CompanyService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.adminFlag = this.authService.isAdmin();
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      name: this.formBuilder.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
      password: this.formBuilder.control('', [Validators.minLength(4), Validators.maxLength(20)]),
      type: this.formBuilder.control(0, [Validators.required])
    });
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const rid = data.id
          if (rid) {
            this.setViewMode(FormMode.EDIT);
            this.loadRoom(rid);
          } else {
            this.setViewMode(FormMode.ADD);
          }
        } catch (e) {
          if(this.adminFlag) this.router.navigate(['/admin/dashboard']);
          else this.router.navigate(['/company/dashboard']);
        }
      }
    });
    this.loadCompanyList();
  }

  get name() { return this.formGroup.get('name'); }
  get password() { return this.formGroup.get('password'); }
  get type() { return this.formGroup.get('type'); }

  title: string;
  mode: FormMode = FormMode.ADD;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Room";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Room";
    }
  }
  companyList = [];
  selected_company;
  loadCompanyList() { 
    this.companyService.list().subscribe(
      data => {
        data.map(item=> {
          this.companyList.push(item);
        });
        this.selected_company = this.companyList[0].id;
      }
    );
  }

  onChangeCompany($event) {
    this.selected_company = $event;
  }

  loadRoom(id: number) {
    this.roomsService.get(id).subscribe(room => {
      this.formGroup.setValue({ 
        id: room.id,
        name: room.name,
        password: room.password,
        type: room.company?room.company.id:0,
      });
    });
  }

  submit(): void {
    const room = this.formGroup.value;
    const user = this.authService.currentUserValue;
    const flag = this.adminFlag?1:2;
    const sendData = flag===1?{...room, user:user.id, flag}:{...room, user:user.id, flag, type: user.company.id}
    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.roomsService.add(sendData).subscribe(
        data => {
          this.toasterService.success('', 'Room created!');
          this.submitted = false;
          if(this.adminFlag) this.router.navigate(['/admin/chat/rooms']);
          else this.router.navigate(['/company/chat/rooms']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.roomsService.update(sendData).subscribe(
        data => {
          this.toasterService.success('', 'Room updated!');
          this.submitted = false;
          if(this.adminFlag) this.router.navigate(['/admin/chat/rooms']);
          else this.router.navigate(['/company/chat/rooms']);
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    if(this.adminFlag) this.router.navigate(['/admin/chat/rooms']);
    else this.router.navigate(['/company/chat/rooms']);
  }

}
