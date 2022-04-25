import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../../../../@core/@services/company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { createTimeoutValidator } from '../../../../../@theme/components';
import { LocationService } from '../../../../../@core/@services/location.service';
import { AuthenticationService } from '../../../../../@core/@services/authentication.service';
import { UserService } from '../../../../../@core/@services/user.service';
import { environment } from '../../../../../../environments/environment';
import timezone from './timezone';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
}

@Component({
  selector: 'ngx-location-create',
  templateUrl: './location-create.component.html',
  styleUrls: ['./location-create.component.scss']
})
export class LocationCreateComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  imagePickerConf = {
    borderRadius: "0%",
    language: "en",
    width: "200px",
    height: "200px",
  };
  photo;
  image;
  databaseList:string[] = [];
  private permission;
  timezoneArr = timezone;

  private company;
  constructor(
    private authService: AuthenticationService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private locationService: LocationService,
    private companyService: CompanyService,
  ) { }

  ngOnInit(): void {
    this.checkPermission();
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      name: this.formBuilder.control('', [Validators.required]),
      description: this.formBuilder.control('', []),
      address: this.formBuilder.control('', [Validators.required]),
      city: this.formBuilder.control('', [Validators.required]),
      state: this.formBuilder.control('', [Validators.required]),
      zip: this.formBuilder.control('', [Validators.required]),
      phone: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      website: this.formBuilder.control('', []),
      hours: this.formBuilder.control('', []),
      timezone: this.formBuilder.control('', []),
      account: this.formBuilder.control('', []),
      soprint: this.formBuilder.control('', []),
      delprint: this.formBuilder.control('', []),
      database: this.formBuilder.control('', [Validators.required]),
      location: this.formBuilder.control('', [Validators.required]),
    });

    this.setViewMode(FormMode.ADD);
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          const id = data.id
          if (cid) {
            this.company = cid;
            this.loadCompany(cid);
            if(id) {
              this.loadLocation(id);
              this.setViewMode(FormMode.EDIT);
            }
          }
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
      }
    });
  }

  get name() { return this.formGroup.get('name'); }
  get description() { return this.formGroup.get('description'); }
  get address() { return this.formGroup.get('address'); }
  get city() { return this.formGroup.get('city'); }
  get state() { return this.formGroup.get('state'); }
  get zip() { return this.formGroup.get('zip'); }
  get phone() { return this.formGroup.get('phone'); }
  get email() { return this.formGroup.get('email'); }
  get website() { return this.formGroup.get('website'); }
  get hours() { return this.formGroup.get('hours'); }
  get timezone() { return this.formGroup.get('timezone'); }
  get account() { return this.formGroup.get('account'); }
  get soprint() { return this.formGroup.get('soprint'); }
  get delprint() { return this.formGroup.get('delprint'); }
  get database() { return this.formGroup.get('database'); }
  get location() { return this.formGroup.get('location'); }

  title: string;
  mode: FormMode;
  setViewMode(viewMode: FormMode) {
    this.mode = viewMode;
    if (this.mode == FormMode.EDIT) {
      this.title = "Edit Company Profile";
    } else if (this.mode == FormMode.ADD) {
      this.title = "Create Company Profile";
    }
  }
  checkPermission() {
    if (this.authService.isAdmin()) {
      this.permission = 'write';
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "furnserve/configurator/company") {
          this.permission = menu.permission
        }
      }
      if (this.permission == "none") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "view") {
        this.router.navigate(['/company/no-permission']);
      }
    }
  }
  phoneInput(event): boolean {
    let newValue = this.phone.value.replace(/\D/g,'')
    if (newValue.length >= 4) {
      newValue = newValue.slice(0, 3) + "-" + newValue.slice(3)
    }
    if (newValue.length >= 8) {
      newValue = newValue.slice(0, 7) + "-" + newValue.slice(7)
    }
    if (newValue.length >= 12) {
      newValue = newValue.slice(0, 12)
    }
    this.phone.setValue(newValue)
    this.phone.updateValueAndValidity()
    return true
  }

  stateInput(event): boolean {
    let newValue = this.state.value.replace(/\d/g,'')
    newValue = newValue.replace(/\W/g,'')
    newValue = newValue.toUpperCase()
    if (newValue.length > 2) {
      newValue = newValue.slice(0, 2)
    }
    this.state.setValue(newValue)
    this.state.updateValueAndValidity()
    return true
  }
  zipInput(event): boolean {
    let newValue = this.zip.value.replace(/\D/g,'')
    if (newValue.length > 6) {
      newValue = newValue.slice(0, 6)
    }
    this.zip.setValue(newValue)
    this.zip.updateValueAndValidity()
    return true
  }

  loadCompany(id: any) {
    this.companyService.get(id).subscribe(company => {
      const databases = company.databases;
      this.databaseList = databases.split(',');
      this.formGroup.controls['database'].setValue(this.databaseList[0]);
    });
  } 
  loadLocation(id: any) {
    this.locationService.get(id).subscribe(location => {
      this.formGroup.setValue({
        id: location.id,
        name: location.name,
        description: location.description,
        address:location.address,
        city: location.city,
        state: location.state,
        zip: location.zip,
        phone: location.phone,
        email: location.email,
        website: location.website,
        hours: location.open_hours,
        timezone: location.timezone,
        account: location.account,
        soprint: location.so_print,
        delprint: location.del_print,
        database: location.database,
        location: location.location,
      })
      this.photo = location.logo_url;
      if (this.photo != "") {
        this.image = environment.baseUrl + '/' + this.photo;
        console.log(this.image)
      }
    });
  } 
  onImageChange(base64) { 
    if (!base64) {
      this.photo = "";
      return;
    }
    const data = base64.split(',');
    if (data.length < 2) return;
    const imageBlob: Blob = this.dataURItoBlob(data[1]);
    const imageName: string = `location_logo_${this.authService.currentUserValue.id}.png`;
    const imageFile: File = new File([imageBlob], imageName, {
      type: "image/png"
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
      return new Blob([int8Array], { type: "image/png" });
  }


  submit(): void {
    const location = this.formGroup.value;
    location.photo = this.photo;
    location.company = this.company;

    this.submitted = true;
    if (this.mode == FormMode.ADD) {
      this.locationService.add(location).subscribe(
        data => {
          this.toasterService.success('', 'Location created!');
          this.submitted = false;
          this.cancel();  
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );  
    } else {
      this.locationService.update(location).subscribe(
        data => {
          this.toasterService.success('', 'Location updated!');
          this.submitted = false;
          this.cancel();
        },
        error => {
          this.toasterService.danger('', error.message);
          this.submitted = false;
        }
      );
    }
  }

  cancel(): void {
    const params = JSON.stringify({ cid: this.company }) 
    this.router.navigate(['/company/furnserve/configurator/company'], { queryParams: { data: encodeURI(params) }});      

  }
}