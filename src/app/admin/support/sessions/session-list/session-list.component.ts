import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../../@core/@services/chat.service';
import { NbToastrService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../../@core/@services/authentication.service';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
} 

@Component({
  selector: 'ngx-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit {

  private alive = true;

  settings: any = {
    mode: 'external',
    actions: {
      add: false,
      edit: true,
      delete: false,
    },
    edit: {
      editButtonContent: '<i class="nb-play-outline"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },
    columns: {
      id: {
        title: 'ID',
      },
      name: {
        title: 'Name',
      },
      company: {
        title: 'Company',
      },
    }
  };

  source;
  constructor(
    private router: Router, 
    private chatService: ChatService,
  ) { }

  ngOnInit(): void {
    this.chatService.emit('getScreenSharedUsers', null);
    this.chatService.listen('usersScreen').pipe(takeWhile(() => this.alive))
    .subscribe((userList:any) => {
      this.source = userList;
    });
  }
  onEdit($event) {
    const params = JSON.stringify({ sid: $event.data.id, name: $event.data.name }) 
    this.router.navigate([`/admin/support/screen`], { queryParams: { data: encodeURI(params) }});
  }
  ngOnDestroy() {
    this.alive = false;
  }
}
