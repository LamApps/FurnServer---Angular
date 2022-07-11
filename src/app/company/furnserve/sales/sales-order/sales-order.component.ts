import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table'
import { NbToastrService } from '@nebular/theme';
import { AuthenticationService } from '../../../../@core/@services/authentication.service';
import { SalesOrderService } from '../../../../@core/@services/sales-order.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NbMenuService } from '@nebular/theme';
import { filter, map } from 'rxjs/operators';

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
  private currentPage:number = 1;

  pages1 = 10;
  pages2 = 10;

  settings = {
    mode: 'external',
    actions: false,
    hideSubHeader: true,
    // pager: { display: false },
    columns: {
      sa_no: {
        title: 'SO#',
        type: 'html',
        valuePrepareFunction : (sa_no) => {
          let txt = sa_no.slice(0,2)+'-'+sa_no.slice(2);
          return '<div class="wide">'+txt+'</div>';
        },
      },
      cust_num: {
        title: 'Customer#',
        type: 'html',
        valuePrepareFunction : (value) => {
          return '<div class="wide1">'+value+'</div>';
        },
      },
      ss_name: {
        title: 'Name',
        type: 'html',
        valuePrepareFunction : (value) => {
          return '<div class="wider">'+value+'</div>';
        },
      },
      ss_order_dt: {
        title: 'Date',
        valuePrepareFunction : (ss_order_dt) => {
          let txt = new Date(ss_order_dt+"T00:00:00").toLocaleDateString('en-US');
          return txt;
        },
      },
      slspr_cd: {
        title: 'Slspr'
      },
      ss_addr1: {
        title: 'Address',
        type: 'html',
        valuePrepareFunction : (value) => {
          return '<div class="widest">'+value+'</div>';
        },
      },
      ss_city: {
        title: 'City',
        type: 'html',
        valuePrepareFunction : (value) => {
          return '<div class="wide1">'+value+'</div>';
        },
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
    rowClassFunction: (row) =>{
      if(row.data.sl_qty > 0){
        return '';
      }else {
        return 'negative';
      }
    },
    columns: {
      sl_line: {
        title: 'Line#',
      },
      sku_cd: {
        title: 'SKU/GL',
        type: 'html',
        valuePrepareFunction: (value, row) => {
          // DATA FROM HERE GOES TO renderComponent
          let returnTxt;
          if(value==""){
            if(row?.gl_acct_no=="") returnTxt = "";
            else returnTxt = row?.gl_acct_no.slice(0,2)+'-'+row?.gl_acct_no.slice(2);
          }else{
            returnTxt = value.slice(0,3)+'-'+value.slice(3,8)+'-'+value.slice(8,12)+'-'+value.slice(12);
          }
          return '<div class="wider">'+returnTxt+'</div>';
        },
      },
      sl_qty: {
        title: 'Qty',
      },
      sl_uprice: {
        title: 'Unit Price',
        valuePrepareFunction: (value) => {
          return value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        },
      },
      sl_amount: {
        title: 'Amount',
        valuePrepareFunction: (value) => {
          return value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        },
      },
      sl_desc: {
        title: 'Description'
      },
      sl_availqty: {
        title: 'Avl',
      },
      sl_chqty: {
        title: 'Chg',
      },
      sl_setqty: {
        title: 'Set',
      },
      sl_delqty: {
        title: 'Del',
      },
      sl_confirm: {
        title: 'Status',
      },
      sl_confirmdt: {
        title: 'Date',
        valuePrepareFunction: (value, row) => {
          // DATA FROM HERE GOES TO renderComponent
          if(row?.sl_confirm=="Charged") return new Date(row?.sl_chargedt+"T00:00:00").toLocaleDateString('en-US')
          else if(row?.sl_confirm=="Confirmed") return new Date(value+"T00:00:00").toLocaleDateString('en-US')
          else if(row?.sl_confirm=="Cancelled") return new Date(row?.sl_canceldt+"T00:00:00").toLocaleDateString('en-US')
        },
      },
      po_no: {
        title: 'PO#',
        type: 'html',
        valuePrepareFunction: (value, row) => {
          // DATA FROM HERE GOES TO renderComponent
          if(value=="") '<div class="wide1">'+value+'</div>';
          else return '<div class="wide1">'+value+' - '+row.pl_lines+'</div>';
        },
      },
      sl_model: {
        title: 'Model#',
        type: 'html',
        valuePrepareFunction : (value) => {
          return '<div class="widest">'+value+'</div>';
        },
      },
      sl_fabric: {
        title: 'Fabric',
      },
      sl_finish: {
        title: 'Finish',
      },
      stax_cd: {
        title: 'Tax Code',
      },
    }
  };

  source = new LocalDataSource();

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

  source1 = new LocalDataSource();
//   source1 = [{
//     "sku_cd": "21023100109501",
//     "so_no": 106401,
//     "sl_line": 1,
//     "sl_uprice": 2099.0,
//     "sl_amount": 2099.0,
//     "sl_logid": "AMBER",
//     "sl_logdate": "2022-03-15",
//     "sl_qty": 0,
//     "sl_desc": "Rec Sofa",
//     "gl_acct_no": "",
//     "sl_gldesc": "",
//     "sl_type": "R",
//     "sl_ss#": 0,
//     "dept_no": "210",
//     "vn_no": "23100",
//     "sl_trans": "21023100109501",
//     "sell_cd": "02",
//     "sl_extint01": 0,
//     "stax_cd": "WV",
//     "re_reason": "",
//     "sl_deliver": "Tentative",
//     "slspr_cd": "MSC",
//     "sl_percent": 6.0,
//     "sl_confirm": "Confirmed",
//     "sl_chqty": 0.0,
//     "sl_canqty": 0.0,
//     "sl_delqty": 0.0,
//     "sl_setqty": 0.0,
//     "sl_availqty": 0.0,
//     "cust_num": "360426",
//     "sal_no": "02106401   1",
//     "acct_type": "WR",
//     "sl_takeqty": 0.0,
//     "sl_callqty": 0.0,
//     "sl_tentqty": 0.0,
//     "sl_tentdt": null,
//     "po_no": "",
//     "pl_lines": 0,
//     "sl_chgamt": 0.0,
//     "category_cd": "",
//     "sl_confirmdt": "2022-03-15",
//     "sl_dcost": 524.0,
//     "sl_fcost": 0.0,
//     "sl_reason": "",
//     "gf_num": 0,
//     "sl_fixed": false,
//     "sl_extchar01": "",
//     "sl_extchar02": "",
//     "sl_chargedt": null,
//     "sl_canceldt": null,
//     "sl_u1char": "",
//     "sl_u2char": "",
//     "sl_u1log": false,
//     "sl_u2log": false,
//     "sl_u1int": 0,
//     "vehicle_cd": "",
//     "sl_deldate": null,
//     "sl_comment": false,
//     "sl_groupflag": "",
//     "sl_groupline": 0,
//     "slspr2_cd": "",
//     "slspr3_cd": "",
//     "sl_consign_type": "",
//     "sl_groupsku": "",
//     "sl_view_order": 1.0,
//     "sl_origprice": 0.0,
//     "sl_link_order": 1.0,
//     "sl_logtime": "26737",
//     "sl_createdt": "2022-03-15",
//     "sl_createtime": "69957",
//     "sl_createid": "APP",
//     "sl_regular_price": 0.0,
//     "room_cd": "",
//     "sl_approval": "",
//     "st_approvedate": null,
//     "slspr4_cd": "",
//     "slspr5_cd": "",
//     "slspr6_cd": "",
//     "slspr7_cd": "",
//     "grp_cd": "",
//     "rm_cd": "",
//     "sl_salestype": "R",
//     "box_cd": "",
//     "cr_salno": "",
//     "CreateProgID": "doUCFTrigger sfoe2.p",
//     "LogProgID": "SOLQtySet so-027.p",
//     "logProgEnviron": "",
//     "Must_ShipDt": null,
//     "Must_ShipQty": null,
//     "sl_EditDate": "2022-03-15",
//     "sl_editTime": 69957,
//     "sl_PrintSeq": 1
// },];

  header:any;
  billTo:any;
  shipTo:any;
  comments:any;

  ctxItems = [{ title: 'STORE' }, { title: 'DELIVERY' }, { title: 'CUSTOMER'}];

  constructor(
    private authService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router, 
    private route: ActivatedRoute,
    private toastrService: NbToastrService,
    private salesService: SalesOrderService,
    private nbMenuService: NbMenuService,
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
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'sales-download-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {console.log(title)});
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      so: this.fb.control(this.savedData?.so || '', [Validators.minLength(9), Validators.maxLength(9)]),
      customer: this.fb.control(this.savedData?.customer || '', [Validators.maxLength(6)]),
      lastname: this.fb.control(this.savedData?.lastname || '', []),
      phone: this.fb.control(this.savedData?.phone || '', [Validators.minLength(12), Validators.maxLength(12)]),
      your: this.fb.control(this.savedData?.your || '', [Validators.maxLength(8)]),
      begindate: this.fb.control(this.savedData?.begindate?new Date(this.savedData?.begindate):null, [Validators.minLength(10), Validators.maxLength(10)]),
      enddate: this.fb.control(this.savedData?.enddate?new Date(this.savedData?.enddate):null, [Validators.minLength(10), Validators.maxLength(10)]),
      location: this.fb.control(this.savedData?.location || '', [Validators.minLength(2), Validators.maxLength(2)]),
      accounttype: this.fb.control(this.savedData?.accounttype || '', [Validators.minLength(2), Validators.maxLength(2)]),
      person: this.fb.control(this.savedData?.person || '', [Validators.maxLength(3)]),
      showOpen: this.fb.control(this.savedData?.showOpen || false, []),
      remember: this.fb.control(this.savedData?.remember || false, []),
    });
  }
  ngOnDestroy() {
    this.alive = false;
  }
  checkPermission() {
    if (this.authService.isAdmin()) {
      this.permission = 'write'
    } else {
      const user = this.authService.currentUserValue;
      const menus = user.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "furnserve/sales/sales-order") {
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

  phoneInput(event): void {
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
    if(event.key === 'Enter' && this.submitted===false) {
      if(newValue!='' && this.phone.valid) this.submit();
    }
  }

  dateInput(event, flag): void {
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
    if (newValue=="") {
      if (flag=='begin') this.begindate.setValue(new Date());
      else this.enddate.setValue(new Date());
    }
    event.target.value = newValue;
    if(event.key === 'Enter' && this.submitted===false) {
      if(newValue.length===10) this.submit();
    }
  }

  nameInput(event):void {
    let newValue = this.lastname.value.replace(/\d/g,'');
    this.lastname.setValue(newValue)
    this.lastname.updateValueAndValidity()
    if(event.key === 'Enter' && this.submitted===false) {
      if(newValue.length>=2) this.submit();
    }
  }

  numberInput(event, flag: string):void {
    let obj = (flag=='customer')?this.customer:this.location;
    let newValue = obj.value.replace(/\D/g,'');
    obj.setValue(newValue)
    obj.updateValueAndValidity()
    if(event.key === 'Enter' && this.submitted===false) {
      if(flag=='customer') {
        if(newValue!='') this.submit();
      }else if(flag=='location') {
        if(newValue!='' && obj.valid) this.submit();
      }
    }
  }

  otherInput(event, flag):void {
    if(event.key === 'Enter' && this.submitted===false) {
      if(flag=="your" && this.your.value!='') this.submit();
      else if(flag=="account" && this.accounttype.value.length>=2) this.submit();
      else if(flag=="person" && this.person.value!='') this.submit();
    }
  }
  soInput(event):void {
    let newValue = this.so.value.replace(/\D/g,'')
    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "-" + newValue.slice(2)
    }
    if (newValue.length >= 10) {
      newValue = newValue.slice(0, 9)
    }
    this.so.setValue(newValue)
    this.so.updateValueAndValidity()
    let charCode = (event.which) ? event.which : event.keyCode;

    if(newValue.length>=9 && ((charCode >= 48 && charCode <= 57) || (charCode >= 96 && charCode <= 105))) this.submit();
  }

  onUserRowSelect(event) {
    this.currentPage = this.source.getPaging().page;
    // this.revealState = true;
    // return;
    
    this.salesService.getOrderDetail(this.company, event.data.sa_no).subscribe((result: any) => {
      this.source1.load(result.TT_so_lines);
      this.source1.setPaging(1, this.pages2);
      this.header = result.TT_so_header[0];
      this.billTo = result.TT_ar_cust[0];
      this.shipTo = result.TT_so_delinst[0];
      this.comments = result.TT_so_comments;

      this.revealState = true;
    });
  }
  onBackBtnClick() {
    setTimeout(() => this.source.setPaging(this.currentPage, this.pages1), 0);
    this.revealState = false;
  }

  handleClose(flag) {
    if(flag=="begin") this.begindate.setValue(null);
    else this.enddate.setValue(null);
  }

  handleRemember(checked: boolean) {
    const searchData = this.searchForm.value;
    const myCompanyId = this.authService.currentUserValue.company?this.authService.currentUserValue.company.id:0;
    if(checked) {
      searchData.remember = true;
      localStorage.setItem('salesSearch'+'_'+this.authService.currentUserValue.id+'_'+myCompanyId, JSON.stringify(searchData));
    }else{
      searchData.remember = false;
      localStorage.removeItem('salesSearch'+'_'+this.authService.currentUserValue.id+'_'+myCompanyId);
    }
  }

  onChangePage(event, flag) {
    if(flag=="search") {
      this.pages1 = event.target.value;
      this.source.setPaging(this.currentPage, event.target.value);
    }
    else {
      this.pages2 = event.target.value;
      this.source1.setPaging(1, event.target.value);
    }
  }
    

  submit() {
    let searchData = this.searchForm.value;
    searchData.so = searchData.so.replace('-','');
    searchData.phone = searchData.phone.replace(/-/g,'');
    this.revealState = false;

    if(searchData.so!="") {
      this.submitted = true;
      this.salesService.getOrderDetail(this.company, searchData.so).subscribe((result: any) => {
        this.submitted = false;
        let name;
        let isEmpty = true;
        for (name in result) {
          if (result.hasOwnProperty(name)) {
            isEmpty = false;
            break;
          }
        }
        if(isEmpty){
          this.toastrService.danger('', 'Please enter a vaild SO #.');
          return;
        }
        this.source1.load(result.TT_so_lines);
        this.source1.setPaging(1, this.pages2);
        this.header = result.TT_so_header?result.TT_so_header[0]:[];
        this.billTo = result.TT_ar_cust?result.TT_ar_cust[0]:[];
        this.shipTo = result.TT_so_delinst?result.TT_so_delinst[0]:[];
        this.comments = result.TT_so_comments || {};
  
        this.revealState = true;
        this.searchForm.setValue({
          accounttype: '',
          begindate: null,
          enddate: null,
          customer: '',
          lastname: '',
          location: '',
          person: '',
          phone: '',
          your: ''
        });
      },
      err => {
        this.toastrService.danger('', 'An error occured!');
        this.submitted = false;
      });

      return;
    }else if(searchData.so=="" && searchData.accounttype=="" && searchData.begindate==null && searchData.customer=="" && searchData.enddate==null && searchData.lastname=="" && searchData.location=="" && searchData.person=="" && searchData.phone=="" && searchData.your=="") {
      this.toastrService.danger('', 'Please filter your results from above before searching');
      return;
    }

    if(searchData.begindate) searchData.begindate = searchData.begindate.toLocaleDateString('en-US');
    if(searchData.enddate) searchData.enddate = searchData.enddate.toLocaleDateString('en-US');
    
    this.submitted = true;
    this.salesService.salesSearch(this.company, searchData).subscribe((result: any) => {
        this.source.load(result);
        this.source.setPaging(1, this.pages1);
        this.submitted = false;
      },
      err => {
        this.toastrService.danger('', 'An error occured!');
        this.submitted = false;
      });
  }
  public openPDF(): void {
    let DATA: any = document.getElementById('orderData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('angular-demo.pdf');
    });
  }
}
