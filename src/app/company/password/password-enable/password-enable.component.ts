import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbThemeService } from '@nebular/theme';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CompanyService } from '../../../@core/@services/company.service';
import { PasswordService } from '../../../@core/@services/password.service';
import { AuthenticationService } from '../../../@core/@services/authentication.service';

@Component({
  selector: 'ngx-password-enable',
  templateUrl: './password-enable.component.html',
  styleUrls: ['./password-enable.component.scss']
})

export class PasswordEnableComponent implements OnInit {
  private alive = true;
  private company;
  permission = "view";

  formGroup: FormGroup;
  submitted: boolean = false;

  passwordList: any[] = [];
  enabledList: any[] = [];
  changedList: any[] = [];

  constructor(
    private authService: AuthenticationService,
    private passwordService: PasswordService,
    private companyService: CompanyService,
    private router: Router, 
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
    });
    
    this.checkPermission();    
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          if (cid) {
            this.company = cid;
            this.loadPasswords()
          } else {
            this.router.navigate(['/company/dashboard']);
          }
        } catch (e) {
          this.router.navigate(['/company/dashboard']);
        }
      } else {
        this.router.navigate(['/company/dashboard']);
      }
    });
  }

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.permission = 'write';
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "apps/invoice/password/enable") {
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

  checkEnable(password: any): boolean {
    for (let i = 0; i < this.enabledList.length; i++) {
      if (this.enabledList[i].id == password.id) {
        return true;
      }
    }
    return false;
  }

  setEnalbe(password: any, event): void { 
    if (event.target.checked) {
      this.changedList.push(password);
    } else {
      for (let i = 0; i < this.changedList.length; i++) {
        if (this.enabledList[i].id == password.id) {
          this.changedList.splice(i, 1);
          break;
        }
      }        
    }
  }

  loadPasswords(): void {
    this.passwordService.list().subscribe(passwords => {
      passwords.sort((a, b)=> {
        return a.name.localeCompare(b.name);
      });
      this.passwordList = passwords;
      this.loadData(this.company);
    });
  }

  loadData(company: any): void {
    this.companyService.get(company).subscribe(data => {
      data.enabled.forEach(enabled => {
        this.enabledList.push(enabled);
      });
      this.changedList = this.enabledList;
    });
  }

  submit(): void {
    this.submitted = true;
    this.companyService.enable(this.company, this.changedList).subscribe(
      data => {
        this.toasterService.success('', 'changed!');
        this.submitted = false;
        this.cancel();
      },
      error => {
        this.toasterService.danger('', error);
        this.submitted = false;
      }
    );
  }

  cancel(): void {
    const params = JSON.stringify({ cid: this.company });
    this.router.navigate([`/company/apps/invoice/password/list`], { queryParams : { data: encodeURI(params) } });
  }
}
