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
  permission:string = 'view';
  revealState:boolean = false;

  messages: any[] = [];
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
    this.checkPermission();
    this.chatService.getContact(this.me.id).subscribe((result) => {
      console.log(result)
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
        takeWhile(() => this.alive),
      )
      .subscribe(title => {
        if(!this.tempUser) return;
        const isTempUserAdmin = this.tempUser.company?false:true;
        const isSelectedUserAdmin = this.selectedUser&&this.selectedUser.company?false:true;
        if(title==='Delete this contact') {
          if(!confirm('Are you sure want to delete this user?')) return;
          this.chatService.deleteContact(this.tempUser.contactId).subscribe(result=>{
            this.contacts = this.viewUsers = this.contacts.filter(user=>{
              if(user.contactId!=this.tempUser.contactId) return user
            })
            this.messages = [];
            this.tempUser = null;
            this.selectedUser = null;
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
                      avatar: replyFlag?null:this.baseUrl+'/'+this.selectedUser.photo,
                    },
                  });
                })
                this.tempUser = null;
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
    { title: 'Delete this contact' },
    { title: 'Delete conversation' },
  ];

  timer:any = null;
  searchStatus:boolean = false;
  searching:boolean = false;
  tempUser:any = null;

  onChange($event) {
    if($event.target.value=="") {
      this.onSearchClose();
      return;
    };
    if(!this.searchStatus) this.searchStatus = true;
    if(!this.searching) this.searching = true;
    if(this.timer !== null) {
      clearTimeout(this.timer);        
    }
    this.timer = setTimeout(()=> {
      this.chatService.getUserList(this.me, $event.target.value).subscribe((users) => {
        this.searching = false;
        this.viewUsers = users.reduce((result, user)=>{
          const company = user.company?user.company.name:'Admin';
          const myCompany = this.me.company?this.me.company.name:'Admin';
          if(this.me.id == user.id && company==myCompany) return result;
          if(this.onlineUsers[user.id+'_'+company]) result.push({...user, socketId: this.onlineUsers[user.id+'_'+company].id, status: this.onlineUsers[user.id+'_'+company].status});
          else result.push({...user, status:'control'})
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

  checkPermission() {
    if (this.authService.isAdmin()) {
      this.permission = 'write'
    } else {
      const menus = this.me.menus;
      for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
        if (menu.menu.link == "chat/conversations") {
          this.permission = menu.permission
        }
      }
      if (this.permission == "none") {
        this.router.navigate(['/company/dashboard']);
      } else if (this.permission == "view") {
        this.router.navigate(['/company/no-permission']);
      }
    }
  }

  processOnline() {
    this.contacts = this.contacts.map(user=>{
      const company = user.company?user.company.name:'Admin';
      if(this.onlineUsers[user.id+'_'+company]) return {...user, socketId: this.onlineUsers[user.id+'_'+company].id, status: this.onlineUsers[user.id+'_'+company].status};
      else return {...user, socketId: null, status: 'control'};
    })
    // this.viewUsers = this.contacts;
  }
  processIncomeMsg(sender) {
    this.contacts = this.contacts.map(user=>{
      const company = user.company?user.company.name:'Admin';
      const income = user.income || 0;
      if(sender.userId == user.id && sender.company == company) return {...user, income: income+1}
      else return user;
    })
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
            avatar: replyFlag?null:this.baseUrl+'/'+this.selectedUser.photo,
          },
        });
      })
      this.revealState = true;
      this.onSearchClose();
    })
    const filterContact = this.contacts.find(contact=>{
      const company = contact.company?contact.company.name:'Admin';
      return user.id==contact.id && company==selectedCompany;
    })
    if(filterContact) filterContact.income = 0;
    // this.viewUsers = this.contacts;
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
    this.chatService.emit('getUserList', null);
    this.chatService.listen('userList').pipe(takeWhile(() => this.alive))
    .subscribe((userList:any) => {
      this.onlineUsers = userList;
      this.processOnline();
      this.viewUsers = this.contacts;
    });
    //Get private message
    this.chatService.listen('privateMessage')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      const selectedCompany = this.selectedUser&&this.selectedUser.company?this.selectedUser.company.name:'Admin';
      const isSelectedAdmin = selectedCompany=='Admin'?true:false;
      //If the selected user send the message
      if(this.selectedUser && message.sender.userId == this.selectedUser.id && message.sender.company == selectedCompany && this.revealState==true){
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
          this.chatService.setRead(this.me.id, message.sender.userId, isSelectedAdmin).subscribe(result=>{})
        }, 1000)
      }else{
        const index = this.contacts.findIndex(user=>{
          const company = user.company?user.company.name:'Admin';
          return message.sender.userId == user.id && message.sender.company == company
        })
        if(index<0) {
          const isSenderAdmin = message.sender.company=='Admin'?true:false;
          this.chatService.getContact(this.me.id).subscribe(result=>{
            const new_contact = result.find(contact=>{
              const user = contact.admin_user||contact.user;
              const isContactAdmin = contact.admin_user?true:false;
              return user.id==message.sender.userId && isContactAdmin==isSenderAdmin
            })
            console.log('new_contact', new_contact)
            const user = new_contact.admin_user||new_contact.user;
            this.contacts.push({...user, contactId: new_contact.id, status: 'success', income: 1})
            this.viewUsers = this.contacts;
          })
        }else{
          this.processIncomeMsg(message.sender)
          this.viewUsers = this.contacts;
        }
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
          const user = item.admin_user || item.user
          const company = user.company?user.company.name:'Admin';
          if(this.onlineUsers[user.id+'_'+company]) return {...user, contactId: item.id, socketId: this.onlineUsers[user.id+'_'+company].id, status: this.onlineUsers[user.id+'_'+company].status};
          else return {...user, contactId: item.id, socketId: null, status: 'control'};
        });
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

