import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from '../../../../@core/@services/authentication.service';
import { SalesOrderService } from '../../../../@core/@services/sales-order.service';

@Component({
  selector: 'ngx-sales-order',
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.scss']
})
export class SalesOrderComponent implements OnInit {
  private alive = true;
  private company;
  private permission = "view";
  searchForm: FormGroup;
  submitted: boolean = false;
  revealState:boolean = false;
  private savedData:any = null;

  settings = {
    mode: 'external',
    actions: false,
    hideSubHeader: true,
    columns: {
      sa_no: {
        title: 'SO#',
        valuePrepareFunction : (sa_no) => {
          let txt = sa_no.slice(0,2)+'-'+sa_no.slice(2);
          return txt;
        },
      },
      cust_num: {
        title: 'Customer#',
      },
      ss_name: {
        title: 'Name',
      },
      ss_order_dt: {
        title: 'Date',
        valuePrepareFunction : (ss_order_dt) => {
          let txt = new Date(ss_order_dt).toLocaleDateString();
          return txt;
        },
      },
      slspr_cd: {
        title: 'Slspr'
      },
      ss_addr1: {
        title: 'Address'
      },
      ss_city: {
        title: 'City',
      },
      ss_state: {
        title: 'State',
      },
      ss_zip: {
        title: 'Zip',
      },
      ss_total: {
        title: 'Total Amount',
      },
      ss_delamt: {
        title: 'Delivery Amount',
      },
      ss_delopen: {
        title: 'Delivery Status',
        valuePrepareFunction : (ss_delopen) => {
          return ss_delopen?'Open':'Closed';
        },
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: true, title: 'Open' },
              { value: false, title: 'Closed' },
            ],
          },
        },
      },
      ss_gov_num: {
        title: 'Your#',
      },
      ss_acct: {
        title: 'Account Type',
      },
      ss_coa: {
        title: 'Delivery Address Type',
      },
      ss_HowRcv: {
        title: 'Pickkup or Delivery',
      },
      ss_U1Int: {
        title: '#Lines',
      },
      stax_cd: {
        title: 'Tax Code',
      },
    }
  };
  settings1 = {
    mode: 'external',
    actions: false,
    hideSubHeader: true,
    columns: {
      sa_no: {
        title: 'Line#',
      },
      cust_num: {
        title: 'SKU/GL',
      },
      ss_name: {
        title: 'Qty',
      },
      ss_order_dt: {
        title: 'Unit Price',
      },
      slspr_cd: {
        title: 'Amount'
      },
      ss_addr1: {
        title: 'Description'
      },
      ss_city: {
        title: 'Avl',
      },
      ss_state: {
        title: 'Chg',
      },
      ss_zip: {
        title: 'Set',
      },
      ss_total: {
        title: 'Del',
      },
      ss_delamt: {
        title: 'Status',
      },
      ss_delopen: {
        title: 'Date',
      },
      ss_gov_num: {
        title: 'PO#',
      },
      ss_acct: {
        title: 'Model#',
      },
      ss_coa: {
        title: 'Fabric',
      },
      ss_HowRcv: {
        title: 'Finish',
      },
      stax_cd: {
        title: 'Tax Code',
      },
    }
  };

  source = [];

  // source = [{
  //   "sa_no": "20001998",
  //   "cust_num": "360281",
  //   "ss_name": "Toothman, Lisa",
  //   "ss_order_dt": "2022-03-15",
  //   "slspr_cd": "H20    ",
  //   "ss_addr1": "3120 Murphy Creek Rd",
  //   "ss_city": "Weston",
  //   "ss_state": "WV",
  //   "ss_zip": "26452",
  //   "ss_total": 2608.98,
  //   "ss_delamt": 0.0,
  //   "ss_delopen": true,
  //   "ss_gov_num": "",
  //   "ss_acct": "CD",
  //   "ss_coa": "MAIN",
  //   "ss_HowRcv": "Delivery",
  //   "ss_U1Int": 3,
  //   "stax_cd": "NT"
  // }];

  source1 = [];

  constructor(
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router, 
    private route: ActivatedRoute,
    private toastrService: NbToastrService,
    private salesService: SalesOrderService,
  ) { }

  get so() { return this.searchForm.get('so'); }
  get customer() { return this.searchForm.get('customer'); }
  get lastname() { return this.searchForm.get('lastname'); }
  get phone() { return this.searchForm.get('phone'); }
  get your() { return this.searchForm.get('your'); }
  get begindate() { return this.searchForm.get('begindate'); }
  get enddate() { return this.searchForm.get('enddate'); }
  get location() { return this.searchForm.get('location'); }
  get accounttype() { return this.searchForm.get('accounttype'); }
  get person() { return this.searchForm.get('person'); }
  get showOpen() { return this.searchForm.get('showOpen'); }
  get remember() { return this.searchForm.get('remember'); }

  ngOnInit(): void {
    // this.checkPermission();
    const myCompanyId = this.authService.currentUserValue.company?this.authService.currentUserValue.company.id:0;
    const storage = localStorage.getItem('salesSearch'+'_'+this.authService.currentUserValue.id+'_'+myCompanyId);
    this.savedData = storage?JSON.parse(storage):null;
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          const cid = data.cid
          console.log(cid)
          if (cid) {
            this.company = cid;
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
    this.initSearchForm();
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      so: this.fb.control(this.savedData?.so || '', [Validators.minLength(9), Validators.maxLength(9)]),
      customer: this.fb.control(this.savedData?.customer || '', [Validators.minLength(6), Validators.maxLength(6)]),
      lastname: this.fb.control(this.savedData?.lastname || '', []),
      phone: this.fb.control(this.savedData?.phone || '', [Validators.minLength(12), Validators.maxLength(12)]),
      your: this.fb.control(this.savedData?.your || '', [Validators.minLength(8), Validators.maxLength(8)]),
      begindate: this.fb.control(this.savedData?new Date(this.savedData?.begindate):new Date(), [Validators.minLength(10), Validators.maxLength(10)]),
      enddate: this.fb.control(this.savedData?new Date(this.savedData?.enddate):new Date(), [Validators.minLength(10), Validators.maxLength(10)]),
      location: this.fb.control(this.savedData?.location || '', [Validators.minLength(2), Validators.maxLength(2)]),
      accounttype: this.fb.control(this.savedData?.accounttype || '', [Validators.minLength(2), Validators.maxLength(2)]),
      person: this.fb.control(this.savedData?.person || '', [Validators.minLength(3), Validators.maxLength(3)]),
      showOpen: this.fb.control(this.savedData?.showOpen || false, []),
      remember: this.fb.control(this.savedData?.remember || false, []),
    });
  }
  ngOnDestroy() {
    this.alive = false;
  }
  // checkPermission() {
  //   if (this.authService.isAdmin()) {
  //     this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
  //   } else {
  //     const user = this.authService.currentUserValue;
  //     const menus = user.role.menus;
  //     for (let i = 0; i < menus.length; i++) {
  //       const menu = menus[i];
  //       if (menu.menu.link == "code") {
  //         this.permission = menu.permission
  //       }
  //     }
  //     if (this.permission == "none") {
  //       this.router.navigate(['/company/no-permission']);
  //     } else if (this.permission == "view") {
  //       this.router.navigate(['/company/no-permission']);
  //     } else if (this.permission == "read") {
  //       this.settings = { ...this.settings, actions: { add: false, edit: false, delete: false }}
  //     } else {
  //       this.settings = { ...this.settings, actions: { add: true, edit: true, delete: true }}
  //     }
  //   }
  // }

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

  dateInput(event): boolean {
    let newValue = event.target.value.replace(/\D/g,'');
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2)
    }
    if (newValue.length >= 6) {
      newValue = newValue.slice(0, 5) + "/" + newValue.slice(5)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 10)
    }
    event.target.value = newValue;
    return true;
  }

  nameInput(event):boolean {
    let newValue = this.lastname.value.replace(/\d/g,'');
    this.lastname.setValue(newValue)
    this.lastname.updateValueAndValidity()
    return true;
  }

  numberInput(event, flag: string):boolean {
    let obj = (flag=='customer')?this.customer:this.location;
    let newValue = obj.value.replace(/\D/g,'');
    obj.setValue(newValue)
    obj.updateValueAndValidity()
    return true;

  }

  soInput(event):boolean {
    let newValue = this.so.value.replace(/\D/g,'')
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "-" + newValue.slice(2)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 9)
    }
    this.so.setValue(newValue)
    this.so.updateValueAndValidity()
    return true
  }

  onUserRowSelect(event) {
    this.salesService.getOrderDetail(this.company, event.data.sa_no).subscribe((result: any) => {
      
    });
    this.revealState = true;
  }
  onBackBtnClick() {

    this.revealState = false;
  }

  submit() {
    let searchData = this.searchForm.value;
    const myCompanyId = this.authService.currentUserValue.company?this.authService.currentUserValue.company.id:0;
    if(searchData.remember){
      localStorage.setItem('salesSearch'+'_'+this.authService.currentUserValue.id+'_'+myCompanyId, JSON.stringify(searchData));
    }else{
      localStorage.removeItem('salesSearch'+'_'+this.authService.currentUserValue.id+'_'+myCompanyId);
    }

    searchData.begindate = searchData.begindate.toLocaleDateString();
    searchData.enddate = searchData.enddate.toLocaleDateString();
    searchData.so = searchData.so.replace('-','');
    this.submitted = true;
    this.salesService.salesSearch(this.company, searchData).subscribe((result: any) => {
        this.source = result;
        this.submitted = false;
      },
      err => {
        this.toastrService.danger('', 'An error occured!');
        this.submitted = false;
      });
  }
}
