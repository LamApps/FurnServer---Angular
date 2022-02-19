import { Component, ViewChild, OnInit } from '@angular/core';
import { map, takeWhile, filter } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../../@core/@services/chat.service';
import { AuthenticationService } from '../../../../@core/@services/authentication.service';
import { NbToastrService, NbMenuService } from '@nebular/theme';
import { environment } from 'environments/environment';

@Component({
  selector: 'ngx-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.scss']
})
export class PrivateChatComponent implements OnInit {

  @ViewChild ('searchInput') searchInput;

  contacts: any[];
  viewUsers: any[] = [];
  onlineUsers:any = {};
  me:any;
  alive:boolean = true;
  baseUrl = environment.baseUrl;
  selectedUser:any = null;

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
  constructor(
    private chatService: ChatService,
    private router: Router, 
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private authService: AuthenticationService,
    private nbMenuService: NbMenuService,
  ) { }

  ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    this.chatService.getContact(this.me.id).subscribe((result) => {
      this.contacts = result.map(item=>{
        const user = item.admin_user || item.user
        return {...user, contactId: item.id}
      });
      this.initRoom();
    })
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'contact-context-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {
        if(!this.tempUser) return;
        const isTempUserAdmin = this.tempUser.company?false:true;
        const isSelectedUserAdmin = this.selectedUser&&this.selectedUser.company?false:true;
        if(title==='Delete this user') {
          if(!confirm('Are you sure want to delete this user?')) return;
          this.chatService.deleteContact(this.tempUser.contactId).subscribe(result=>{
            this.contacts = this.viewUsers = this.contacts.filter(user=>{
              if(user.contactId!=this.tempUser.contactId) return user
            })
            this.toasterService.success('', 'Contact is successfully deleted!')
          })
        }else if(title==='Delete conversation') {
          if(!confirm('Are you sure want to delete all conversation?')) return;
          this.chatService.deleteChatLog(this.me.id, this.tempUser.id, isTempUserAdmin).subscribe(res=>{
            this.toasterService.success('', 'Conversation is successfully deleted!')
            if(this.selectedUser && this.selectedUser.id == this.tempUser.id && isSelectedUserAdmin == isTempUserAdmin){
              this.chatService.getChatLog(this.me.id, this.tempUser.id, isTempUserAdmin).subscribe(result=>{
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
                      name: replyFlag?'':this.selectedUser.firstname+' '+this.selectedUser.lastname,
                      avatar: replyFlag?null:this.selectedUser.photo,
                    },
                  });
                })
              })
            }
          })
        
        }
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  contextMenuItems = [
    { title: 'Delete this user' },
    { title: 'Delete conversation' },
  ];

  timer:any = null;
  searchStatus:boolean = false;
  searching:boolean = false;
  tempUser:any = null;

  onChange($event) {
    if(!this.searchStatus) this.searchStatus = true;
    if(!this.searching) this.searching = true;
    if(this.timer !== null) {
      clearTimeout(this.timer);        
    }
    this.timer = setTimeout(()=> {
      this.chatService.getUserList(this.me.id, $event.target.value).subscribe((users) => {
        this.searching = false;
        this.viewUsers = users.reduce((result, user)=>{
          const company = user.company?user.company.name:'Admin';
          const myCompany = this.me.company?this.me.company.name:'Admin';
          if(this.me.id == user.id && company==myCompany) return result;
          if(this.onlineUsers[user.id+'_'+company]) result.push({...user, socketId: this.onlineUsers[user.id+'_'+company].id});
          else result.push(user)
          return result;
        }, []);
        // this.viewUsers = result.map(user=>{
        //   const company = user.company?user.company.name:'Admin';
        //   const myCompany = this.me.company?this.me.company.name:'Admin';
        //   if(this.me.id == user.id && company==myCompany) return false;
        //   if(this.onlineUsers[user.id+'_'+company]) return {...user, socketId: this.onlineUsers[user.id+'_'+company].id}
        //   else return user
        // });
      })
    }, 800);
  }

  onVerticalMenuClick($event, user) {
    this.tempUser = user;
  }

  processOnline() {
    this.contacts = this.contacts.map(user=>{
      const company = user.company?user.company.name:'Admin';
      if(this.onlineUsers[user.id+'_'+company]) return {...user, socketId: this.onlineUsers[user.id+'_'+company].id};
      else return {...user, socketId: null};
    })
    this.viewUsers = this.contacts;
  }
  onSearchClose() {
    this.searching = false;
    this.searchStatus = false;
    this.viewUsers = this.contacts;
    this.searchInput.nativeElement.value = '';
  }

  onSelectUser($event, user) {
    this.selectedUser = user;
    const isSelectedAdmin = user.company?false:true;
    const selectedCompany = user.company?user.company.name:'Admin';
    this.chatService.getChatLog(this.me.id, user.id, isSelectedAdmin).subscribe(result=>{
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
            name: replyFlag?'':this.selectedUser.firstname+' '+this.selectedUser.lastname,
            avatar: replyFlag?null:this.selectedUser.photo,
          },
        });
      })
    })
    const filterContact = this.contacts.find(contact=>{
      const company = contact.company?contact.company.name:'Admin';
      return user.id==contact.id && company==selectedCompany;
    })
    filterContact.income = 0;
    this.viewUsers = this.contacts;
    this.chatService.setReadMessage(this.me.id, user.id, isSelectedAdmin)
  }
  initRoom() {
    // Get unread messages
    this.chatService.getUnreadMessages(this.me.id).subscribe(result=>{
      const unreadObj = {};
      result.map(msg=>{
        const adminFlag = msg.sender_admin?'admin':'user';
        const sender = msg.sender||msg.sender_admin;
        if(unreadObj[adminFlag+'_'+sender.id]) unreadObj[adminFlag+'_'+sender.id] += 1;
        else unreadObj[adminFlag+'_'+sender.id] = 1;
      })
      this.contacts = this.contacts.map(user=>{
        const adminFlag = user.company?'user':'admin';
        if(unreadObj[adminFlag+'_'+user.id]) return {...user, income: unreadObj[adminFlag+'_'+user.id]}
        else return {...user, income: 0}
      })
      this.viewUsers = this.contacts;
    })
    // Get online users
    this.chatService.emit('getConnectedUsers', null);
    this.chatService.listen('userList').pipe(takeWhile(() => this.alive))
    .subscribe((userList:any) => {
      this.onlineUsers = userList;
      this.processOnline();
    });
    //Get private message
    this.chatService.listen('privateMessage')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      const selectedCompany = this.selectedUser&&this.selectedUser.company?this.selectedUser.company.name:'Admin';
      if(this.selectedUser && message.sender.userId == this.selectedUser.id && message.sender.company == selectedCompany){
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
      }else{
        this.contacts = this.contacts.map(user=>{
          const company = user.company?user.company.name:'Admin';
          const income = user.income || 0;
          if(message.sender.userId == user.id && message.sender.company == company) return {...user, income: income+1}
          else return {...user, income: 0}
        })
        this.viewUsers = this.contacts;
      }
    });
  }

  sendMessage(event: any) {
    if(!this.selectedUser) {
      this.toasterService.danger('', 'Please select the user first');
      return;
    }
    this.chatService.emit('privateMessage', {receipent: this.selectedUser, message: event.message});
    const index = this.contacts.findIndex(contact=>{
      const company = contact.company?contact.company.name:'Admin';
      const selectedCompany = this.selectedUser.company?this.selectedUser.company.name:'Admin';
      return contact.id==this.selectedUser.id && company===selectedCompany
    })
    if(index<0) {
      this.chatService.addContact(this.me.id, this.selectedUser).subscribe(result=>{
        this.contacts = result.map(item=>{
          return item.admin_user || item.user
        });
        this.processOnline();
      })
    }
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

