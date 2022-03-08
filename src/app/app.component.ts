/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { CodeService } from '../app/@core/@services/code.service';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private analytics: AnalyticsService,
              private codeService: CodeService,
              private router: Router,
              private route: ActivatedRoute,
          ) {
              this.initUser();
              // this.executeScript();
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
  }

  private componentBeforeNavigation = null;
  private executeScript() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe((event: NavigationEnd) => {
      let currentRoute = this.route;
      while (currentRoute.firstChild) currentRoute = currentRoute.firstChild;
      if (this.componentBeforeNavigation !== currentRoute.component) {
        const param = currentRoute.queryParams.subscribe(param=>{
          if(param.data) this.loadScript(JSON.parse(decodeURI(param.data)).cid)
          else this.loadScript(0)
        })
      }
      this.componentBeforeNavigation = currentRoute.component;
    });
  }
  loadScript(cid: number) {
    if(localStorage.getItem('currentUser')){
      const oldScript = document.getElementById('custom-script');
      if(oldScript) oldScript.parentNode.removeChild(oldScript);
      const script = document.createElement('script');
      script.id = "custom-script";
      if(this.codeService.hasData()){
        this.codeService.getData().map((code)=>{
          if(!code.company) script.innerHTML += code.content;
          if(code.company && code.company.id === cid) script.innerHTML += code.content;
        })
        document.head.appendChild(script);
      }else{
        this.codeService.getActiveList().subscribe((result) => {
          this.codeService.setData(result);
          result.map(code => {
            if(!code.company) script.innerHTML += code.content;
            if(code.company && code.company.id === cid) script.innerHTML += code.content;
          })
          document.head.appendChild(script);
        })
      }
    }
  }

  initUser() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
