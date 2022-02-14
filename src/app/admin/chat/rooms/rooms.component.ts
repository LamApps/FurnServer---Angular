import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomsService } from '../../../@core/@services/rooms.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { ChatService } from '../../../@core/@services/chat.service';

@Component({
  selector: 'ngx-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  private alive = true;

  settings = {
    mode: 'external',
    actions: {
      edit: false,
      delete: false,
      custom: [
        { 
          name: 'join', 
          title: `<i class="nb-arrow-thin-right" title="Enter"></i>` 
        },
        { 
          name: 'customEdit', 
          title: `<i class="nb-edit" title="Edit"></i>` 
        },
        { 
          name: 'customDelete', 
          title: `<i class="nb-trash" title="Delete "></i>` 
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
  company: number = 0;

  constructor(
    private roomsService: RoomsService,
    private router: Router, 
    private route: ActivatedRoute,
    private chatService: ChatService,
    private toastrService: NbToastrService) { 
  }
  roomInfo;
  ngOnInit(): void {
    this.chatService.emit('getRoomInfo', null);
    this.chatService.listen('roomInfo')
      .pipe(takeWhile(() => this.alive))
      .subscribe((info:[]) => {
        this.roomInfo = info;
        this.route.queryParams.subscribe(params => {
          if (params['data']) {
            try {
              const data = JSON.parse(decodeURI(params['data']))
              const cid = data.cid;
              this.company = cid;
              if (cid) {
                this.loadData(cid);
              } else {
                this.loadData(0);
              }
            } catch (e) {
              this.loadData(0);
            }
          } else {
            this.loadData(0);
          }
        });
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  loadData(company: number) {
    this.roomsService.list(company).subscribe((result) => {
      const data = result.map(room => {
        var index = this.roomInfo.findIndex(info=>info.name=='room_'+room.id);
        console.log(index)
        return {
          id: room.id,
          name: room.name,
          users: index>-1?this.roomInfo[index].users:0,
          creator: room.adminuser?room.adminuser.firstname+" "+room.adminuser.lastname:room.user.firstname+" "+room.user.lastname,
          password: room.password,
          permission: room.company?room.company.name:'Public',
          created: room.created
        }
      })
      this.source = data;
    })
  }

  createApps() {
    this.router.navigate(['/admin/chat/rooms/create/']);
  }

  onEdit(id: number) {
    const params = JSON.stringify({ id: id }) 
    this.router.navigate([`/admin/chat/rooms/edit/`], { queryParams: { data: encodeURI(params) }});
  }
  onCustom($event: any) {
    if($event.action == 'customEdit') {
      this.onEdit($event.data.id)
    }else if($event.action == 'customDelete') {
      this.onDelete($event.data.id)
    }else {
      const params = JSON.stringify({ id: $event.data.id }) 
      this.router.navigate([`/admin/chat/rooms/enter/`], { queryParams: { data: encodeURI(params) }});  
    }
  }
  onDelete(id: number) {
    if (confirm('Are you sure wants to delete this room?') && id) {
      this.roomsService
        .delete(id)
        .pipe(takeWhile(() => this.alive))
        .subscribe((res) => {
          if (res) {
            this.toastrService.success('', 'Room deleted!');
            this.loadData(this.company);
          } else {
            this.toastrService.danger('', 'Oops! An error occured.');
          }
        });
    }
  }
}
