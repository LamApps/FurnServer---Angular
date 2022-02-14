import { NbMenuItem } from '@nebular/theme';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthenticationService } from 'app/@core/@services/authentication.service';
import * as store from 'store2';
import { NbIconLibraries } from '@nebular/theme';

@Injectable()
export class AdminMenu {
  constructor(
    private authService: AuthenticationService,
	private iconLibraries: NbIconLibraries
  ) {
	this.iconLibraries.registerFontPack('font-awesome', { iconClassPrefix: 'fa', packClass: 'fa' });
	this.iconLibraries.registerSvgPack('my-icons', { 'chair': '<img src="../../assets/images/chair.png" width="20px">' })
  }

	getPermissionMenu(company: any, menu: any): NbMenuItem {
		var result: NbMenuItem;
		if (menu.link) {
			if (!this.authService.isAdmin()) {
				let permission = 'view';
				for (let i = 0; i < company.menus.length; i++) {
					if ('/company/' + company.menus[i].menu.link == menu.link) {
						permission = company.menus[i].permission;
						break;
					}
				}
				if (permission == 'none') return undefined;
				result = { ...result, link: menu.link }
				
				const user = this.authService.currentUserValue;
				const user_menus = user.menus;
				for (let i = 0; i < user_menus.length; i++) {
					if ('/company/' + user_menus[i].menu.link == menu.link) {
						permission = user_menus[i].permission;
						break;
					}
				}
				if (permission == 'none') return undefined;
				result = { ...result, link: menu.link }
			} else {
				result = { ...result, link: menu.link }
			}
		} 
		if (menu.title) {
			result = { ...result, title: menu.title }
		}
		if (menu.icon) {
			result = { ...result, icon: menu.icon }
		}
		if (menu.queryParams) {
			result = { ...result, queryParams: menu.queryParams }
		}
		if (menu.children) {
			let newChild = [];
			for (let i = 0; i < menu.children.length; i++) {
				let child = this.getPermissionMenu(company, menu.children[i]);
				if (child == undefined) continue;
				newChild.push(child)
			}
			if (newChild.length > 0) {
				result = { ...result, children: newChild }
			}
		}
		return result;
	}

  getMenu(companies: any[]): Observable<NbMenuItem[]> {
    const dashboardMenu: NbMenuItem[] = [
		{
			title: 'ADMIN',
			group: true,
		},
		{
			title: 'Dashboard',
			icon: 'home-outline',
			link: '/admin/dashboard',
			home: true,
			children: undefined,
		},
    ];

    const userMenu: NbMenuItem[] = [
      {
        title: 'Users',
        icon: 'person-outline',
        children: [
			{
				title: 'List',
				link: '/admin/users/list',
			},
			{
				title: 'Roles',
				link: '/admin/users/roles',
			},
        ],
      },
    ];

    const companyMenu: NbMenuItem[] = [
      {
        title: 'Companies',
        icon: 'people-outline',
        link: '/admin/companies',
      },
    ];

	const permissionMenu: NbMenuItem[] = [
		{
		  title: 'Permissions',
		  icon: 'shield-outline',
		  children: [
			  {
				  title: 'List',
				  link: '/admin/permissions'
			  },
			  {
				  title: 'Assign',
				  link: '/admin/permissions/assign'
			  }
		  ]
		},
	  ];

    const appMenu: NbMenuItem[] = [
      {
        title: 'Apps',
        icon: 'grid-outline',
        link: '/admin/apps',
        children: [
			{
				title: 'Invoice',
				children: [
					{
						title: 'Companies',
						icon: 'people-outline',
						link: '/admin/apps/invoice/companies',
					},
					{
						title: 'Passwords',
						icon: 'lock-outline',
						link: '/admin/apps/invoice/password',
					}
				]
			}
        ]
      }
    ];

	const utilsMenu: NbMenuItem[] = [
		{
		  title: 'Utilities',
		  icon: { icon: 'tools', pack: 'font-awesome' },
		  link: '/admin/utilities',
		  children: [
			  {
				  title: 'Backups',
				  link: '/admin/utilities/backups',
			  }
		  ]
		}
	  ];

	const codeMenu: NbMenuItem[] = [
		{
		  title: 'Code',
		  icon: 'code',
		  link: '/admin/code',
		},
	];

	const chatMenu: NbMenuItem[] = [
		{
		  title: 'Chat',
		  icon: 'message-square-outline',
		  link: '/admin/chat',
		  children: [
			{
				title: 'Rooms',
				link: '/admin/chat/rooms',
			},
			{
				title: 'Conversations',
				link: '/admin/chat/conversations',
			}
		]
		},
	];
	
    var companysMenu: NbMenuItem[] = [
		{
			title: 'COMPANY',
			group: true,
		},
    ];

	if (!store.get('adminuser')) {
		const companyDashboard = {
			title: 'Dashboard',
			icon: 'home-outline',
			link: '/company/dashboard',
			home: true,
			children: undefined,
		}
		companysMenu.push(companyDashboard);
	}


    const user = this.authService.currentUserValue;
	const sortedCompanies = companies.sort(function(a, b){
		let x = a.name.toLowerCase();
		let y = b.name.toLowerCase();
		if (x < y) {return -1;}
		if (x > y) {return 1;}
		return 0;
	  });
	sortedCompanies && sortedCompanies.length &&
	sortedCompanies.forEach(item => {
	  if (store.get('adminuser') || (user.hasOwnProperty('company') && user.company.id == item.id)) {
		const params = JSON.stringify({ cid: item.id }) 
        const menu = {
          title: item.name,
          icon: 'people-outline',
		  children: [ 
			{
				title: 'Users',
				icon: 'person-outline',
				link: `/company/users/list`,
				queryParams: { data: encodeURI(params) },
			},
		  {
			  title: 'FurnServe',
			//   icon: { icon: 'chair', pack: 'font-awesome' },
			  icon: { icon: 'chair', pack: 'my-icons' },
			  link: '/company/furnserve',
			  children: [
				  {
					title: 'Accounting',
					link: '/company/furnserve/accounting',
					children: [
						{
							title: 'Accounts Payable',
							link: `/company/furnserve/accounting/account-payable`,
							children: [
									{
									  title: 'AP Inquiry',
									  link: `/company/furnserve/accounting/account-payable/ap-inquiry`,
									  queryParams: { data: encodeURI(params) },
									},
									{
									  title: 'AP Reports',
									  link: `/company/furnserve/accounting/account-payable/ap-reports`,
									  queryParams: { data: encodeURI(params) },
								  },
								  {
									  title: 'Bank Reconciliation',
									  link: `/company/furnserve/accounting/account-payable/bank-reconciliation`,
									  queryParams: { data: encodeURI(params) },
								  },
								  {
									  title: 'Disbursements',
									  link: `/company/furnserve/accounting/account-payable/disbursements`,
									  queryParams: { data: encodeURI(params) },
								  },
								  {
									  title: 'Invoice Entry',
									  link: `/company/furnserve/accounting/account-payable/invoice-entry`,
									  queryParams: { data: encodeURI(params) },
								  },
								  {
									  title: 'Process Invoices',
									  link: `/company/furnserve/accounting/account-payable/process-invoices`,
									  queryParams: { data: encodeURI(params) },
								  },
							]
						},
						{
						  title: 'Accounts Receivable',
						  link: `/company/furnserve/accounting/accounts-receivable`,
						  children: [
							  {
								  title: 'Batch Finilization',
								  link: `/company/furnserve/accounting/account-receivable/batch-finilization`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'Calculations',
								  link: `/company/furnserve/accounting/account-receivable/calculations`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'Create Account',
								  link: `/company/furnserve/accounting/account-receivable/create-account`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'Enter Payment',
								  link: `/company/furnserve/accounting/account-receivable/enter-payment`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'Lookup',
								  link: `/company/furnserve/accounting/account-receivable/lookup`,
								  children: [
									  {
										  title: 'Accounts',
										  link: `/company/furnserve/accounting/account-receivable/lookup/accounts`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Transactions',
										  link: `/company/furnserve/accounting/account-receivable/lookup/transactions`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Gift Certificates',
										  link: `/company/furnserve/accounting/account-receivable/lookup/gift-certificates`,
										  queryParams: { data: encodeURI(params) },
									  },
								  ]
							  },
							  {
								  title: 'Month End Procedures',
								  link: `/company/furnserve/accounting/account-receivable/month-end-procedures`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'Reports',
								  link: `/company/furnserve/accounting/account-receivable/reports`,
								  queryParams: { data: encodeURI(params) },
								  children: [
									  {
										  title: 'Aged Trail Balance',
										  link: `/company/furnserve/accounting/account-receivable/reports/aged-trail-balance`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Balance',
										  link: `/company/furnserve/accounting/account-receivable/reports/balance`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Balance Due',
										  link: `/company/furnserve/accounting/account-receivable/reports/balance-due`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Batch Finilization',
										  link: `/company/furnserve/accounting/account-receivable/reports/batch-finilization`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Customer Balance',
										  link: `/company/furnserve/accounting/account-receivable/reports/customer-balance`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Daily Checkout',
										  link: `/company/furnserve/accounting/account-receivable/reports/daily-checkout`,
										  queryParams: { data: encodeURI(params) },
									  },
									  {
										  title: 'Pay Balance',
										  link: `/company/furnserve/accounting/account-receivable/reports/pay-balance`,
										  queryParams: { data: encodeURI(params) },
									  },
								  ]
							  },
							  {
								  title: 'Statements',
								  link: `/company/furnserve/accounting/account-receivable/statements`,
								  queryParams: { data: encodeURI(params) },
							  },
						  ]
						},
						{
							title: 'General Ledger',
							link: `/company/furnserve/accounting/general-ledger`,
							children: [
								{
									title: 'Lookup',
									link: `/company/furnserve/accounting/general-ledger/lookup`,
									children: [
										{
											title: 'GL',
											link: `/company/furnserve/accounting/general-ledger/lookup/gl`,
											queryParams: { data: encodeURI(params) },
										},
										{
											title: 'GL Recurring',
											link: `/company/furnserve/accounting/general-ledger/lookup/gl-recurring`,
											queryParams: { data: encodeURI(params) },
										},
									]
								},
								{
									title: 'GL Recurring Run',
									link: `/company/furnserve/accounting/general-ledger/gl-recurring-run`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Create Budget',
									link: `/company/furnserve/accounting/general-ledger/create-budget`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Create Statements',
									link: `/company/furnserve/accounting/general-ledger/create-statements`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Format Statements',
									link: `/company/furnserve/accounting/general-ledger/format-statements`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Reports',
									link: `/company/furnserve/accounting/general-ledger/reports`,
									children: [
										{
											title: 'Financial',
											link: `/company/furnserve/accounting/general-ledger/reports/financial`,
											queryParams: { data: encodeURI(params) },
										},
										{
											title: 'General Ledger',
											link: `/company/furnserve/accounting/general-ledger/reports/general-ledger`,
											queryParams: { data: encodeURI(params) },
										},
										{
											title: 'GL Reconciliation',
											link: `/company/furnserve/accounting/general-ledger/reports/gl-reconciliation`,
											queryParams: { data: encodeURI(params) },
										},
										{
											title: 'Report Manager',
											link: `/company/furnserve/accounting/general-ledger/reports/report-manager`,
											queryParams: { data: encodeURI(params) },
										},
										{
											title: 'Trail Balance',
											link: `/company/furnserve/accounting/general-ledger/reports/trail-balance`,
											queryParams: { data: encodeURI(params) },
										},
									]
								},
							]
						  },
					]
				  },
				  {
					title: 'Configurator',
					link: `/company/furnserve/configurator`,
					children: [
						{
						  title: 'API',
						  link: `/company/furnserve/configurator/api`,
						  children: [
							  {
								  title: 'Company',
								  link: `/company/furnserve/configurator/api/company`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'User',
								  link: `/company/furnserve/configurator/api/user`,
								  queryParams: { data: encodeURI(params) },
							  },
						  ]
						},
						{
						  title: 'Sessions',
						  link: `/company/furnserve/configurator/sessions`,
						  queryParams: { data: encodeURI(params) },
						  children: [
							  {
								  title: 'List',
								  link: `/company/furnserve/configurator/sessions/list`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								  title: 'Logs',
								  link: `/company/furnserve/configurator/sessions/logs`,
								  queryParams: { data: encodeURI(params) },
							  },
						  ]
						}
					]
				  },
				  {
					title: 'Customer Service',
					link: `/company/furnserve/customer-service`,
					children: [
						{
						  title: 'Returns and Refunds',
						  link: `/company/furnserve/customer-service/returns-and-refunds`,
						  children: [
							  {
								  title: 'Enter a Return',
								  link: `/company/furnserve/customer-service/returns-and-refunds/enter-a-return`,
								  queryParams: { data: encodeURI(params) },
							  },
							  {
								title: 'Enter an Exchange',
								link: `/company/furnserve/customer-service/returns-and-refunds/enter-an-exchange`,
								queryParams: { data: encodeURI(params) },
							  },
							  {
								title: 'Adjust Dollars On SO',
								link: `/company/furnserve/customer-service/returns-and-refunds/adjust-dollars-on-so`,
								queryParams: { data: encodeURI(params) },
							  },
						  ]
						},
						{
							title: 'Post Customer Payments',
							link: `/company/furnserve/customer-service/post-customer-payments`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Maintain Customer Deposit',
							link: `/company/furnserve/customer-service/maintain-customer-deposit`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Service Views',
							link: `/company/furnserve/customer-service/service-views`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Service Reports',
							link: `/company/furnserve/customer-service/service-reports`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Service Processing',
							link: `/company/furnserve/customer-service/service-processing`,
							queryParams: { data: encodeURI(params) },
						},
					]
				  },
				  {
					title: 'Financing',
					link: `/company/furnserve/financing`,
					children: [
						{
							title: 'Configurator',
							link: `/company/furnserve/financing/configurator`,
							children: [
								{
									title: 'API',
									link: `/company/furnserve/financing/configurator/api`,
									children: [
										{
											title: 'Company',
											link: `/company/furnserve/financing/configurator/api/company`,
											children: [
												{
													title: 'Wells-Fargo',
													link: `/company/furnserve/financing/configurator/api/company/wells-fargo`,
													queryParams: { data: encodeURI(params) },
												},
												{
													title: 'Synchrony',
													link: `/company/furnserve/financing/configurator/api/company/synchrony`,
													queryParams: { data: encodeURI(params) },
												},
												{
													title: 'TD Bank',
													link: `/company/furnserve/financing/configurator/api/company/td-bank`,
													queryParams: { data: encodeURI(params) },
												},
												{
													title: 'Snap',
													link: `/company/furnserve/financing/configurator/api/company/snap`,
													queryParams: { data: encodeURI(params) },
												},
												{
													title: 'Fortiva',
													link: `/company/furnserve/financing/configurator/api/company/fortiva`,
													queryParams: { data: encodeURI(params) },
												},
												{
													title: 'Merchants Preferred',
													link: `/company/furnserve/financing/configurator/api/company/merchants-preferred`,
													queryParams: { data: encodeURI(params) },
												},
											]
										}
									]
								}
							]
						}
					]
				  },
				  {
					title: 'Downloads',
					link: `/company/furnserve/downloads`,
					queryParams: { data: encodeURI(params) },
				  },
				  {
					title: 'Inventory',
					link: `/company/furnserve/inventory`,
					children: [
						{
							title: 'Cycle Inventory',
							link: `/company/furnserve/inventory/cycle-inventory`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'UCF Inquiry',
							link: `/company/furnserve/inventory/ucf-inquiry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'SKU Inquiry',
							link: `/company/furnserve/inventory/sku-inquiry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'SKU Availability',
							link: `/company/furnserve/inventory/sku-availability`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Transfer',
							link: `/company/furnserve/inventory/transfer`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Reports',
							link: `/company/furnserve/inventory/reports`,
							queryParams: { data: encodeURI(params) },
						},
					]
				  },
				  {
					title: 'Logistics',
					link: `/company/furnserve/logistics`,
					children: [
						{
							title: 'Delivery Inquiry',
							link: `/company/furnserve/logistics/delivery-inquiry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Delivery Anlaysis',
							link: `/company/furnserve/logistics/delivery-anlaysis`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Driver',
							link: `/company/furnserve/logistics/driver`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Finilization',
							link: `/company/furnserve/logistics/finilization`,
							children: [
								{
									title: 'Truck',
									link: `/company/furnserve/logistics/finilization/truck`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Pick-Up',
									link: `/company/furnserve/logistics/finilization/pick-up`,
									queryParams: { data: encodeURI(params) },
								},
							]
						},
						{
							title: 'Pickup Inquiry',
							link: `/company/furnserve/logistics/pickup-inquiry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Transfers',
							link: `/company/furnserve/logistics/transfers`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Trucks',
							link: `/company/furnserve/logistics/trucks`,
							children: [
								{
									title: 'Create',
									link: `/company/furnserve/logistics/trucks/create`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Attach Zones',
									link: `/company/furnserve/logistics/trucks/attach-zones`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Schedule Trucks',
									link: `/company/furnserve/logistics/trucks/schedule-trucks`,
									queryParams: { data: encodeURI(params) },
								},
								{
									title: 'Schedule Pickup',
									link: `/company/furnserve/logistics/trucks/schedule-pickup`,
									queryParams: { data: encodeURI(params) },
								},
							]
						},
						{
							title: 'Shipping Zones',
							link: `/company/furnserve/logistics/shipping-zones`,
							children: [
								{
									title: 'Create Zone',
									link: `/company/furnserve/logistics/shipping-zones/create-zone`,
									queryParams: { data: encodeURI(params) },
								}
							]
						},
						{
							title: 'Will Call Inquiry',
							link: `/company/furnserve/logistics/will-call-inquiry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Will Drop Inquiry',
							link: `/company/furnserve/logistics/will-drop-inquiry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Zip Code',
							link: `/company/furnserve/logistics/zip-code`,
							queryParams: { data: encodeURI(params) },
						},
					]
				  },
				  {
					title: 'Merchandise',
					link: `/company/furnserve/merchandise`,
					children: [
						{
							title: 'Line-Ups',
							link: `/company/furnserve/merchandise/line-ups`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Pricing',
							link: `/company/furnserve/merchandise/pricing`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Purchasing',
							link: `/company/furnserve/merchandise/purchasing`,
							queryParams: { data: encodeURI(params) },
						},
					]
				  },
				  {
					title: 'Purchase Orders',
					link: `/company/furnserve/purchase-orders`,
					children: [
						{
							title: 'Acknowledge',
							link: `/company/furnserve/purchase-orders/acknowledge`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Advice',
							link: `/company/furnserve/purchase-orders/advice`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Consolidate',
							link: `/company/furnserve/purchase-orders/consolidate`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Create',
							link: `/company/furnserve/purchase-orders/create`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Print',
							link: `/company/furnserve/purchase-orders/print`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Process',
							link: `/company/furnserve/purchase-orders/process`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Search',
							link: `/company/furnserve/purchase-orders/search`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Receive',
							link: `/company/furnserve/purchase-orders/receive`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Unreceive',
							link: `/company/furnserve/purchase-orders/unreceive`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Vendor Master File',
							link: `/company/furnserve/purchase-orders/vendor-master-file`,
							queryParams: { data: encodeURI(params) },
						},
					]
				  },
				  {
					title: 'Sales',
					link: `/company/furnserve/sales`,
					children: [
						{
							title: 'Analysis',
							link: `/company/furnserve/sales/analysis`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Consignment',
							link: `/company/furnserve/sales/consignment`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Projects',
							link: `/company/furnserve/sales/projects`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Sales Order',
							link: `/company/furnserve/sales/sales-order`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Sales Order Entry',
							link: `/company/furnserve/sales/sales-order-entry`,
							queryParams: { data: encodeURI(params) },
						},
						{
							title: 'Zip Code',
							link: `/company/furnserve/sales/zip-code`,
							queryParams: { data: encodeURI(params) },
						},
					]
				  },
			  ]
		  },
		  {
			title: 'Apps',
			icon: 'grid-outline',
			link: '/company/apps',
			children: [
			  {
				title: 'Invoice',
				link: '/company/apps/invoice',
				children: [
				  { 
					title: 'Devices',
					icon: 'smartphone-outline',
					children: [
					  {
						title: 'UUID',
						link: `/company/apps/invoice/devices/uuid`,
						queryParams: { data: encodeURI(params) },
					  }
					]
				  },
				  {
					title: 'Email',
					icon: 'email-outline',
					link: `/company/apps/invoice/email/list`,
					queryParams: { data: encodeURI(params) },
				  },
				  {
					title: 'Password',
					icon: 'lock-outline',
					children: [
					  {
						title: 'Enable Password',
						link: `/company/apps/invoice/password/enable`,
						queryParams: { data: encodeURI(params) },
					  },
					  {
						title: 'List',
						link: `/company/apps/invoice/password/list`,
						queryParams: { data: encodeURI(params) },
					  }
					]
				  }
				],
			  },
			]
		  },
		  {
			title: 'Permissions',
			icon: 'shield-outline',
			link: '/company/permissions',
			children: [
				{
					title: 'List',
					link: '/company/permissions/list',
 					queryParams: { data: encodeURI(params) },
				},
				{
					title: 'Roles',
					link: '/company/permissions/roles',
					queryParams: { data: encodeURI(params) },
				},
				{
					title: 'Assign',
					link: '/company/permissions/assign',
					queryParams: { data: encodeURI(params) },
				}
			]
		  },
		  {
			  title: 'Edit Dashboard',
			  icon: 'home-outline',
			  link: `/company/dashboard/edit`,
		  },
		  {
			title: 'Configuration',
			icon: 'settings-outline',
			link: `/company/configuration`,
			children: [
			{
				title: 'Sessions',
				link: `/company/configuration/sessions`,
				children: [
					{
						title: 'List',
						link: `/company/configuration/sessions/list`,
						queryParams: { data: encodeURI(params) },
					},
					{
						title: 'Logs',
						link: `/company/configuration/sessions/logs`,
						queryParams: { data: encodeURI(params) },
					},
				]
			},
			]
		  },
		  {
			title: 'Code',
			icon: 'code',
			link: `/company/code`,
			queryParams: { data: encodeURI(params) },
		  },
		  {
			title: 'Chat',
			icon: 'message-square-outline',
			link: `/company/chat`,
			children: [
				{
					title: 'Rooms',
					link: '/company/chat/rooms',
 					queryParams: { data: encodeURI(params) },
				},
				{
					title: 'Conversations',
					link: '/company/chat/conversations',
					queryParams: { data: encodeURI(params) },
				},
			]
		  }
		  ]
        };
		const permissionMenu = this.getPermissionMenu(item, menu);
		companysMenu.push(permissionMenu);
      }
    });
    
    if (store.get("adminuser")) {
      return Observable.create(observer => {
        observer.next([...dashboardMenu, ...userMenu, ...companyMenu, ...permissionMenu, ...appMenu, ...utilsMenu, ...codeMenu, ...chatMenu, ...companysMenu]);
        observer.complete();
      })  
    } else {
      return Observable.create(observer => {
        observer.next([...companysMenu]);
        observer.complete();
      })  
    }
  }
}
