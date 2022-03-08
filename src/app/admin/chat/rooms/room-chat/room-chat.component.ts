import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../../@core/@services/chat.service';
import { RoomsService } from '../../../../@core/@services/rooms.service';
import { AuthenticationService } from '../../../../@core/@services/authentication.service';
import { NbToastrService, NbMenuService } from '@nebular/theme';
import { map, filter, takeWhile } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'ngx-room-chat',
  templateUrl: './room-chat.component.html',
  styleUrls: ['./room-chat.component.scss']
})
export class RoomChatComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  alive:boolean = false;
  baseUrl = environment.baseUrl;
  selectedUser:any = 'all';
  me:any;
  permission:string = 'view';

  constructor(
    private formBuilder: FormBuilder,
    private chatService: ChatService,
    private router: Router, 
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private toasterService: NbToastrService,
    private authService: AuthenticationService,
    private menuService: NbMenuService,
  ) { }

  permitted: boolean = false;
  roomName: string;
  roomCreator:any;
  publicMessages: any[] = [];
  publicUnreads: number = 0;
  messages: any[] = [
    {
      text: 'Welcome!',
      date: new Date(),
      reply: false,
      dateFormat: 'h:mm a',
      user: {
        name: 'Bot',
        avatar: 'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png',
      },
    },
  ];
  users: any[] = [];
  tempUser:any;
  bannedUsers: any[] = [];

  contextMenuItems = [
    { title: 'Kick this user' },
    { title: 'Ban this user' },
  ];

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
  ngOnInit(): void {
    this.alive = true;
    this.me = this.authService.currentUserValue;
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      password: this.formBuilder.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]),
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']));
          const roomid = data.id;
          if (roomid) {
            this.roomsService.getBannedUsers(roomid).subscribe(result=>{
              const index = result.findIndex(item=>{
                const user = item.adminuser||item.user;
                const isAdmin = this.me.company?false:true;
                const isHeAdmin = user.company?false:true;
                return user.id==this.me.id && isAdmin === isHeAdmin
              })
              if(index>-1) {
                this.toasterService.danger('', 'You are banned to join this room!');
                if(this.me.company) this.router.navigate(['/company/chat/rooms']);
                else this.router.navigate(['/admin/chat/rooms']);
              }else{
                this.bannedUsers = result.map(item=>{
                  return {id: item.id, user: item.adminuser || item.user}
                });
                this.loadRoom(roomid);
              }
            })
          } else {
            if(this.me.company) this.router.navigate(['/company/dashboard']);
            else this.router.navigate(['/admin/dashboard']);

          }
        } catch (e) {
          if(this.me.company) this.router.navigate(['/company/dashboard']);
          else this.router.navigate(['/admin/dashboard']);
        }
      }
    });
    this.checkPermission();
    this.menuService.onItemClick()
    .pipe(
      filter(({ tag }) => tag === 'room-context-menu'),
      map(({ item: { title } }) => title),
      takeWhile(() => this.alive),
    )
    .subscribe(title => {
      if(!this.tempUser) return;
      if(title === 'Kick this user') {
        this.chatService.emit('kickUser', this.tempUser);
      }else if(title === 'Ban this user') {
        this.chatService.emit('banUser', this.tempUser);
      }
    });
  }
  ngOnDestroy() {
    this.alive = false;
    this.chatService.emit('leaveRoom', '');
  }
  loadRoom(id: number) {
    this.roomsService.getPublic(id).subscribe(room => {
      this.formGroup.setValue({ 
        id: room.id,
        password: '',
      });
      if(room.password === '1') this.permitted = false;
      else if(room.password === '0') {
        this.initRoom();
      }
      else this.permitted = false;
      this.roomName = room.name;
      this.roomCreator = room.adminuser||room.user;
    });
  }
  get password() { return this.formGroup.get('password'); }
  get roomid() { return this.formGroup.get('id').value; }

  initRoom() {
    this.permitted = true;
    this.chatService.emit('joinRoom', {
      roomId: this.roomid, 
    });
    this.chatService.listen('usersRoom')
      .pipe(takeWhile(() => this.alive))
      .subscribe((users:any) => {
        this.users = users.filter(user=>{
          const myCompany = this.me.company?this.me.company.name:'Admin';
          if(user.userId != this.me.id || user.company != myCompany) return {...user, income: 0};
        });
      });
    this.chatService.listen('roomMessage')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      const myName = this.me.firstname + ' ' + this.me.lastname;
      let incomeMsg;
      if(myName !== message.sender){
        incomeMsg = {
          text: message.message,
          date: new Date(),
          dateFormat: 'h:mm a',
          reply: false,
          type: 'text',
          user: {
            name: message.name,
            avatar: message.avatar==""?message.avatar:this.baseUrl+'/'+message.avatar,
          },
        };
        if(this.selectedUser=='all'){
          this.messages.push(incomeMsg);
        }else{
          this.publicUnreads++;
        }
        this.publicMessages.push(incomeMsg);
      }
    });

    //Get private message
    this.chatService.listen('privateMessage')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      if(this.selectedUser!='all' && message.sender.userId == this.selectedUser.userId && message.sender.company == this.selectedUser.company){
        this.messages.push({
          text: message.message,
          date: new Date(),
          dateFormat: 'h:mm a',
          reply: false,
          type: 'text',
          user: {
            name: message.sender.name,
            avatar: message.sender.avatar==""?message.sender.avatar:this.baseUrl+'/'+message.sender.avatar,
          },
        });
        setTimeout(()=>{
          const isAdmin = message.sender.company=='Admin'?true:false;
          this.chatService.setRead(this.me.id, message.sender.userId, isAdmin).subscribe(result=>{})
        }, 1000)
      }else{
        this.users = this.users.map(user=>{
          const income = user.income || 0;
          if(message.sender.userId == user.userId && message.sender.company == user.company) return {...user, income: income+1};
          else return user;
        })
      }
    });
    this.chatService.listen('clearRoomMessages')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      if(this.selectedUser=='all') this.messages = [];
      this.publicMessages = [];
      this.publicUnreads = 0;
      this.toasterService.success('', 'Room Creator cleared all messages');
    })
    this.chatService.listen('kickUser')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      this.toasterService.danger('', 'You are kicked!');
      if(this.me.company) this.router.navigate(['/company/chat/rooms']);
      else this.router.navigate(['/admin/chat/rooms']);
    })
    this.chatService.listen('banUser')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      this.toasterService.danger('', 'You are banned to join this room!');
      if(this.me.company) this.router.navigate(['/company/chat/rooms']);
      else this.router.navigate(['/admin/chat/rooms']);
    })
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
      }
    }
  }
  onRemoveBannedUser(id) {
    if(!confirm('Are you sure want to unban this user?')) return;
    this.roomsService.removeBannedUser(id).subscribe(result=>{
      if(result.affected>0){
        this.bannedUsers = this.bannedUsers.filter(item=>{
          return item.id!=id
        })
      };
    })
  }
  onClearMessages() {
    this.chatService.emit('clearRoomMessages', null);
    if(this.selectedUser=='all') this.messages = [];
    else this.publicMessages = [];
    this.publicUnreads = 0;
  }
  onVerticalMenuClick(user) {
    this.tempUser = user;
  }
  onSelectUser(user) {
    this.selectedUser = user;
    const isSelectedAdmin = user.company=='Admin'?true:false;
    if(user=='all'){
      this.publicUnreads = 0;
      this.messages = this.publicMessages;
    }else{
      this.chatService.getChatLog(this.me.id, user.userId, isSelectedAdmin).subscribe(result=>{
        this.messages = [];
        const myId = this.me.id;
        const isAdmin = this.me.company?false:true;
        result.map(msg=>{
          const replyFlag = isAdmin?msg.sender_admin && msg.sender_admin.id == myId:msg.sender && msg.sender.id == myId;
          this.messages.push({
            text: msg.message,
            date: new Date(msg.sended),
            dateFormat: 'h:mm a',
            reply: replyFlag,
            type: 'text',
            user: {
              name: replyFlag?'':this.selectedUser.name,
              avatar: replyFlag?null:this.selectedUser.avatar,
            },
          });
        })
      })
      const filterContact:any = this.users.find((item:any)=>{
        return user.userId==item.userId && user.company==item.company;
      })
      if(filterContact) filterContact.income = 0;
    }

  }
  sendMessage(event: any) {
    if(this.selectedUser=='all'){
      this.chatService.emit('roomMessage', event.message);
      this.messages.push({
        text: event.message,
        date: new Date(),
        dateFormat: 'h:mm a',
        reply: true,
        type: 'text',
        user: {
          name: "",
        },
      });  
    }else{
      this.chatService.emit('privateMessage', {receipent: {id: this.selectedUser.userId, socketId: this.selectedUser.id, company: this.selectedUser.company=='Admin'?null:this.selectedUser.company}, message: event.message});
      this.messages.push({
        text: event.message,
        date: new Date(),
        dateFormat: 'h:mm a',
        reply: true,
        type: 'text',
        user: {
          name: "",
        },
      });
  
    }
  }
  submit(): void {
    const password = this.formGroup.value;
    this.submitted = true;
    const sendData = this.me.company?{...password, company: this.me.company.id}:password;
    this.roomsService.verify(sendData).subscribe(
      data => {
        this.submitted = false;
        if(data) this.initRoom();
        else this.toasterService.danger('', 'Incorrect password!');
      },
      error => {
        this.toasterService.danger('', error.message);
        this.submitted = false;
      }
    );  
  }

  cancel(): void {
    if(this.me.company) this.router.navigate(['/company/chat/rooms']);
    else this.router.navigate(['/admin/chat/rooms']);
  }

}
