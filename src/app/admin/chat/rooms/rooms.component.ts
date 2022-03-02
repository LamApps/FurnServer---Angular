import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomsService } from '../../../@core/@services/rooms.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { ChatService } from '../../../@core/@services/chat.service';
import { AuthenticationService } from '../../../@core/@services/authentication.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'ngx-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  private alive = true;

  settings: any = {
    mode: 'external',
    actions: {
      edit: false,
      delete: false,
      custom: [
        { 
          name: 'join', 
          title: `<i class="fa fa-door-open room-table-icon" title="Enter"></i>` 
        },
        { 
          name: 'customEdit', 
          title: `<i class="fa fa-edit room-table-icon" title="Edit"></i>` 
        },
        { 
          name: 'customDelete', 
          title: `<i class="fa fa-trash-alt room-table-icon" title="Delete "></i>` 
        }
      ],
    },
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
    },

    columns: {
      name: {
          title: 'Name',
      },
      users: {
        title: 'Users',
      },
      creator: {
          title: 'Creator',
      },
      password: {
        title: 'Password',
        valuePrepareFunction : (password) => {
          return password?'Yes':'No';
        },
        filter: {
          type: 'list',
          config: {
            selectText: 'All',
            list: [
              { value: 1, title: 'Yes' },
              { value: 0, title: 'No' },
            ],
          },
        },
      },
      permission: {
          title: 'Permission',
        },
      created: {
        title: 'Created At',
        valuePrepareFunction : (created) => {
          return new Date(created).toLocaleDateString();
        },
      }
    }
  };

  source;

  constructor(
    private roomsService: RoomsService,
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private chatService: ChatService,
    private toastrService: NbToastrService) { 
  }
  roomInfo;
  me;
  permission = "view";

  ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    this.chatService.emit('getRoomInfo', null);
    this.chatService.listen('roomInfo')
      .pipe(takeWhile(() => this.alive))
      .subscribe((info:[]) => {
        this.roomInfo = info;
        const company = this.me.company?this.me.company.id:0;
        this.loadData(company);
        // this.route.queryParams.subscribe(params => {
        //   if (params['data']) {
        //     try {
        //       const data = JSON.parse(decodeURI(params['data']))
        //       const cid = data.cid;
        //       this.company = cid;
        //       if (cid) {
        //         this.loadData(cid);
        //       } else {
        //         this.loadData(0);
        //       }
        //     } catch (e) {
        //       this.loadData(0);
        //     }
        //   } else {
        //     this.loadData(0);
        //   }
        // });
      });
    this.checkPermission();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  onCustom($event: any) {
    if($event.action == 'customEdit') {
      this.onEdit($event.data)
    }else if($event.action == 'customDelete') {
      this.onDelete($event.data)
    }else {
      const params = JSON.stringify({ id: $event.data.id }) 
      if(this.me.company) this.router.navigate([`/company/chat/rooms/enter/`], { queryParams: { data: encodeURI(params) }});
      else this.router.navigate([`/admin/chat/rooms/enter/`], { queryParams: { data: encodeURI(params) }});
    }
  }

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.permission = 'write'
    } else {
      const menus = this.me.role.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "chat/rooms") {
          this.permission = menu.permission
        }
      }
      if (this.permission == "none") {
        this.router.navigate(['/company/no-permission']);
      } else if (this.permission == "view") {
        this.router.navigate(['/company/no-permission']);
      } else if(this.permission == "read") {
        this.settings.actions = {
          add: false,
          edit: false,
          delete: false,
          custom: [{ 
              name: 'join', 
              title: `<i class="fa fa-door-open room-table-icon" title="Enter"></i>` 
          },]
        }
      } else if(this.permission == "write") {
        this.settings.actions = {
          add: true,
          edit: false,
          delete: false,
          custom: [
            { 
              name: 'join', 
              title: `<i class="fa fa-door-open room-table-icon" title="Enter"></i>` 
            },
            { 
              name: 'customEdit', 
              title: `<i class="fa fa-edit room-table-icon" title="Edit"></i>` 
            },
            { 
              name: 'customDelete', 
              title: `<i class="fa fa-trash-alt room-table-icon" title="Delete "></i>` 
            }
          ]
        }
      }
    }
  }

  loadData(company: number) {
    this.roomsService.list(company).subscribe((result) => {
      console.log(result)
      this.source = result.map(room => {
        var index = this.roomInfo.findIndex(info=>info.name=='room_'+room.id);
        return {
          id: room.id,
          name: room.name,
          users: index>-1?this.roomInfo[index].users:0,
          creator: room.adminuser?room.adminuser.firstname+" "+room.adminuser.lastname:room.user.firstname+" "+room.user.lastname,
          creator_id: room.adminuser?room.adminuser.id:room.user.id,
          creator_admin: room.company?false:true,
          password: room.password?'Yes':'No',
          permission: room.company?room.company.name:'Public',
          created: new Date(room.created).toLocaleDateString()
        }
      })
    })
  }

  createApps() {
    if(this.me.company) this.router.navigate(['/company/chat/rooms/create/']);
    else this.router.navigate(['/admin/chat/rooms/create/']);
  }

  onEdit(data:any) {
    const isAdmin = this.me.company?false:true;
    if(this.me.id==data.creator_id && isAdmin==data.creator_admin) {
      const params = JSON.stringify({ id: data.id });
      if(this.me.company) this.router.navigate([`/company/chat/rooms/edit/`], { queryParams: { data: encodeURI(params) }});
      else this.router.navigate([`/admin/chat/rooms/edit/`], { queryParams: { data: encodeURI(params) }});
    }else{
      this.toastrService.danger('', 'You can not edit this room info.');
    }
  }
  onDelete(data:any) {
    const isAdmin = this.me.company?false:true;
    if(this.me.id==data.creator_id && isAdmin==data.creator_admin) {
      if (confirm('Are you sure wants to delete this room?') && data.id) {
        this.roomsService
          .delete(data.id)
          .pipe(takeWhile(() => this.alive))
          .subscribe((res) => {
            if (res) {
              this.toastrService.success('', 'Room deleted!');
              this.loadData(this.me.company?this.me.company.id:0);
            } else {
              this.toastrService.danger('', 'Oops! An error occured.');
            }
          });
      }
    }else{
      this.toastrService.danger('', 'You can not delete this room.');
    }
  }
}
