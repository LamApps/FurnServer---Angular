import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable, Observer, Subject} from 'rxjs';
import { NbToastrService } from '@nebular/theme';
import {EMAIL_PATTERN, NUMBERS_PATTERN} from '../../../@auth/components';
import { NbTokenService} from '@nebular/auth';
import { AdminuserService } from 'app/@core/@services/adminuser.service';
import { AuthenticationService } from 'app/@core/@services/authentication.service';
import { DatePipe } from '@angular/common';
import { environment } from 'environments/environment';
import { NbDialogService } from '@nebular/theme';
import { ResetPasswordComponent } from '../../../@components/reset-password/reset-password'
@Component({
  selector: 'ngx-user',
  templateUrl: './adminuser.component.html',
  styleUrls: ['./adminuser.component.scss'],
})
export class AdminuserComponent implements OnInit, OnDestroy {

  imagePickerConf = {
    borderRadius: "50%",
    language: "en",
    width: "200px",
    height: "200px",
  };

  userForm: FormGroup;
  submitted: boolean = false;
  photo;
  image;

  protected readonly unsubscribe$ = new Subject<void>();

  get firstname() { return this.userForm.get('firstname'); }
  get lastname() { return this.userForm.get('lastname'); }
  get login() { return this.userForm.get('login'); }
  get email() { return this.userForm.get('email'); }
  get mobile() { return this.userForm.get('mobile'); }
  get position() { return this.userForm.get('position'); }
  get birthday() { return this.userForm.get('birthday'); }
  get password() { return this.userForm.get('password'); }

  constructor(private authService: AuthenticationService,
              private userService: AdminuserService,
              private router: Router,
              private route: ActivatedRoute,
              private tokenService: NbTokenService,
              private toasterService: NbToastrService,
              private datePipe: DatePipe,
              private fb: FormBuilder,
              private dialogService: NbDialogService) {
  }

  ngOnInit(): void {
    this.initUserForm();
    this.loadUser();
  }

  mobileFormat(event): boolean {    
    let newValue = this.mobile.value.replace(/\D/g,'')
    if (newValue.length >= 4) {
      newValue = newValue.slice(0, 3) + "-" + newValue.slice(3)
    }
    if (newValue.length >= 8) {
      newValue = newValue.slice(0, 7) + "-" + newValue.slice(7)
    }
    if (newValue.length >= 12) {
      newValue = newValue.slice(0, 12)
    }
    this.mobile.setValue(newValue)
    this.mobile.updateValueAndValidity()
    return true
  }

  initUserForm() {
    this.userForm = this.fb.group({
      id: this.fb.control(''),
      username: this.fb.control(''),
      role: this.fb.control(''),
      firstname: this.fb.control('', []),
      lastname: this.fb.control('', []),
      login: this.fb.control('', []),
      mobile: this.fb.control('', [Validators.minLength(12), Validators.maxLength(12)]),
      email: this.fb.control('', [
        Validators.pattern(EMAIL_PATTERN),
      ]),
      position: this.fb.control('', []),
      birthday: this.fb.control('', []),
      password: this.fb.control('', [])
    });
  }

  loadUser(id?) {
    const user = this.authService.currentUserValue;
    this.userForm.setValue({
      id: user.id ? user.id : '',
      username: user.username ? user.username : '',
      role: user.role ? user.role : '',
      firstname: user.firstname ? user.firstname : '',
      lastname: user.lastname ? user.lastname : '',
      login: user.login ? user.login : '',
      email: user.email ? user.email: '',
      position: user.position ? user.position: '',
      birthday: user.birthday ? user.birthday: '',
      mobile: user.mobile ? user.mobile : '',
      password: '',
    });
    this.onBirthdayChange();
    this.photo = user.photo;
    if (this.photo != "") {
      this.image = environment.baseUrl + '/' + this.photo;
    }
  }

  reset_password() {
    this.dialogService.open(ResetPasswordComponent)
      .onClose.subscribe(password => {
        this.password.setValue(password)
      })
  }

  submit() {
    var user = this.userForm.value
    user.photo = this.photo
    user.active = true

    const birthday = new Date(user.birthday).toLocaleDateString()
    user = { ...user, birthday: birthday }

    this.submitted = true
    this.userService.update(user).subscribe((result: any) => {
        if (result.item) {
          let updated = result.item;
          updated.token = this.authService.currentUserValue.token;
          this.authService.setUserValue(result.item);
          this.handleSuccessResponse();
        }
      },
      err => {
        this.handleWrongResponse(err)
      })
  }

  isValidDate(date: string) : boolean {
    if (date === "") return true;
    const dateArray = date.split("/");
    if (dateArray.length > 3) return false;
    if (dateArray.length > 0 && dateArray[0].length > 0) {
      let test = /^\d+$/.test(dateArray[0]);
      if (!test || dateArray[0].length > 2) return false;
      if (parseInt(dateArray[0]) > 12) return false;
    }
    if (dateArray.length > 1 && dateArray[0].length != 2) return false;
    if (dateArray.length > 1 && dateArray[1].length > 0) {
      let test = /^\d+$/.test(dateArray[1]);
      if (!test || dateArray[1].length > 2) return false;
      if (parseInt(dateArray[1]) > 31) return false;
    }
    if (dateArray.length > 2 && dateArray[1].length != 2) return false;
    if (dateArray.length > 2 && dateArray[2].length > 0) {
      let test = /^\d+$/.test(dateArray[2]);
      if (!test || dateArray[2].length > 4) return false;
    }
    return true;
  }

  onBirthdayChange() {
    let newValue = this.birthday.value.replace(/\D/g,'')
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2)
    }
    if (newValue.length >= 6) {
      newValue = newValue.slice(0, 5) + "/" + newValue.slice(5)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 10)
    }
    this.birthday.setValue(newValue)
    this.birthday.updateValueAndValidity()
    return true
  }

  onImageChange(base64) { 
    if (!base64) {
      this.photo = ""
      return
    }
    const data = base64.split(',');
    if (data.length < 2) return;
    const imageBlob: Blob = this.dataURItoBlob(data[1]);
    const imageName: string = `profile_photo_${this.authService.currentUserValue.id}.jpeg`;
    const imageFile: File = new File([imageBlob], imageName, {
      type: "image/jpeg"
    });
    this.userService.uploadPhoto(imageFile).subscribe((result: any) => {
      this.photo = result.filename;
    },
    err => {
    })
  }

  dataURItoBlob(dataURI: string): Blob {
      const byteString: string = window.atob(dataURI);
      const arrayBuffer: ArrayBuffer = new ArrayBuffer(byteString.length);
      const int8Array: Uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
      }
      return new Blob([int8Array], { type: "image/jpeg" });
  }

  handleSuccessResponse() {
    this.submitted = false;
    this.toasterService.success('', 'Updated');
    this.cancel();
  }

  handleWrongResponse(err) {
    this.submitted = false
    this.toasterService.danger('', err)
  }

  cancel() {
    this.router.navigate(['/admin/users/list'])
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
