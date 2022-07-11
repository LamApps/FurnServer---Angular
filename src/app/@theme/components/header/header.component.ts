/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService, NbToastrService } from '@nebular/theme';

import { LayoutService, RippleService } from '../../../@core/utils';
import { map, filter, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AuthenticationService } from '../../../../app/@core/@services/authentication.service';
import { User } from '../../../../app/@core/@models/user';
import { environment } from '../../../../environments/environment';
import store from 'store2';
import { ChatService } from '../../../@core/@services/chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  public readonly materialTheme$: Observable<boolean>;
  private audio = new Audio(environment.baseUrl+'/ringtone.mp3');
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: User;
  photo;
  company;
  status:string = 'success';
  themes = [
    {
      value: 'material-light',
      name: 'Material Light',
    },
    {
      value: 'material-dark',
      name: 'Material Dark',
    },
  ];

  currentTheme = 'material-light';
  userMenu = this.getMenuItems();
  msgCount = 0;

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private authService: AuthenticationService,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              private chatService: ChatService,
              private router: Router,
              private toasterService: NbToastrService,
              private rippleService: RippleService) {
    this.materialTheme$ = this.themeService.onThemeChange()
      .pipe(
        map(theme => {
          const themeName: string = (theme && theme.name) || '';
          return themeName.startsWith('material');
      }));
  }
  
  getCookieValue(key: any){
	  return document.cookie
		  .split('; ')
		  .find(row => row.startsWith(key + '='))
		  .split('=')[1];
  }

  getMenuItems() {
	  var userLink = '';
    if (store.get('adminuser')) userLink = this.user ? '/admin/users/current/' : '';
    else userLink = this.user ? `/company/users/current/` : '';
    return [
      { title: 'Profile', link: userLink, icon: 'person-outline'},
      { 
        title: 'Set Status',
        expanded: false,
        icon: 'person-done-outline',
        children: [
          {
            title: 'Active',
            icon: 'checkmark-outline',
          },
          {
            title: 'Away',
            icon: 'loader-outline',
          },
          {
            title: 'Busy',
            icon: 'slash-outline',
          },
          {
            title: 'Offline',
            icon: 'wifi-off-outline',
          },
        ],
      },
      { title: 'Log out', link: '/auth/logout', icon: 'log-out-outline'},
    ]
  }

  ngOnInit() {

    document.body.addEventListener('touchstart', this.unlockAudio, false)
    document.body.addEventListener('click', this.unlockAudio, false)
    this.currentTheme = this.themeService.currentTheme;
    this.user = this.authService.currentUserValue;
    this.status = this.user.default_status;
    if (this.user.photo != "") {
      this.photo = environment.baseUrl + "/" + this.user.photo;
    } else {
      this.photo = "";
    }

    this.userMenu = this.getMenuItems();

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => {
        this.currentTheme = themeName;
        this.rippleService.toggle(themeName.startsWith('material'));
      });

      this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = this.authService.currentUserValue;
        if (!this.user) { return }
        if (this.user.photo != "") {
          this.photo = environment.baseUrl + "/" + this.user.photo;
        } else {
          this.photo = "";
        }
      })

    this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-context-menu'),
        map(({ item: { title } }) => title),
        takeUntil(this.destroy$),
      )
      .subscribe(title => {
        this.onStatusChange(title);
      });

    //Get private message
    this.chatService.listen('privateMessage')
    .pipe(takeUntil(this.destroy$))
    .subscribe((message:any) => {
      try{
        console.log(this.audio)
        if(this.user.sound) this.audio.play();
      }catch(e){}
      const currentUrl = this.router.url.split('?')[0];
      if(currentUrl!=='/admin/chat/conversations' && currentUrl!=='/company/chat/conversations'){
        if(this.user.chat_alert){
          const viewMsg = message.message.length>50?message.message.slice(0,50)+'...':message.message;
          const toastrRef = this.toasterService.success(viewMsg, 'New message from '+message.sender.name, {duration: this.user.alert_fadetime * 1000});
        }
        this.msgCount++;
      }
    });


    this.chatService.getUnreadMessages(this.user.id).subscribe(result=>{
      this.msgCount = result.length;
    })
    
  }

  ngOnChanges() {
  }

  unlockAudio = ()=>{
    try {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise.then(_ => {
          this.audio.pause();
          this.audio.currentTime = 0;
        })
        .catch(error => {
        });
      }
      document.body.removeEventListener('touchstart', this.unlockAudio, false)
      document.body.removeEventListener('click', this.unlockAudio, false)
    }catch(e){
    }
  }

  onChatActionClick() {
    this.msgCount = 0;
    const url = store.get('adminuser')?'admin/chat/conversations':'company/chat/conversations'
    this.router.navigate([url]);
  }

  onStatusChange(title: string){
    if(title=="Active") this.status = 'success';
    else if(title=="Away") this.status = 'warning';
    else if(title=="Busy") this.status = 'danger';
    else if(title=="Offline") this.status = 'control';
    this.chatService.emit('statusChange', this.status);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
