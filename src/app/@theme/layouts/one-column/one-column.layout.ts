import { Component, ElementRef, ViewChild } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive start>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <a #close_sidemenu (click)="toggleSidebar()" class="overlay collapsed">
          <div style="background: #000; opacity:.5; position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 998;"></div>
        </a>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <ngx-footer></ngx-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent {

  @ViewChild('close_sidemenu', { static: false }) close_sidemenu: ElementRef;
  expanded: boolean = false;

  constructor(private sidebarService: NbSidebarService) {
  }

  ngOnInit() {
    this.sidebarService.onToggle().subscribe(() => {
      this.expanded = !this.expanded
      if (this.expanded) {
        this.close_sidemenu.nativeElement.className = "overlay"
      } else {
        this.close_sidemenu.nativeElement.className = "overlay collapsed"
      }
    })
  }
  
  toggleSidebar() {
    this.sidebarService.toggle(true, 'menu-sidebar');
  }
}
