import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../../@core/@services/chat.service';
import { RoomsService } from '../../../../@core/@services/rooms.service';
import { AuthenticationService } from '../../../../@core/@services/authentication.service';
import { NbToastrService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Component({
  selector: 'ngx-room-chat',
  templateUrl: './room-chat.component.html',
  styleUrls: ['./room-chat.component.scss']
})
export class RoomChatComponent implements OnInit {

  formGroup: FormGroup;
  submitted: boolean = false;
  alive:boolean = true;
  baseUrl = environment.baseUrl;

  constructor(
    private formBuilder: FormBuilder,
    private chatService: ChatService,
    private router: Router, 
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private toasterService: NbToastrService,
    private authService: AuthenticationService
  ) { }

  permitted: boolean = false;
  roomName: string = '';
  company: number;
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
  users: [] = [];
  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      id: this.formBuilder.control('', []),
      password: this.formBuilder.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]),
    });

    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']));
          const roomid = data.id;
          const company = data.cid;

          if (roomid) {
            this.loadRoom(roomid);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
        } catch (e) {
          this.router.navigate(['/admin/dashboard']);
        }
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
    });
  }
  get password() { return this.formGroup.get('password'); }
  get roomid() { return this.formGroup.get('id').value; }

  initRoom() {
    this.permitted = true;
    const currentUserValue = this.authService.currentUserValue;
    this.chatService.emit('joinRoom', {
      roomId: this.roomid, 
      fullName: currentUserValue.firstname + ' '+ currentUserValue.lastname,
      company: currentUserValue.company?currentUserValue.company.name: 'Admin',
      avatar: currentUserValue.photo,
      userId: currentUserValue.id,
    });
    this.chatService.listen('usersRoom')
      .pipe(takeWhile(() => this.alive))
      .subscribe((users:[]) => {
        this.users = users;
      });
    this.chatService.listen('roomMessage')
    .pipe(takeWhile(() => this.alive))
    .subscribe((message:any) => {
      const myName = this.authService.currentUserValue.firstname + ' ' + this.authService.currentUserValue.lastname;
      if(myName !== message.sender){
        this.messages.push({
          text: message.message,
          date: new Date(),
          dateFormat: 'h:mm a',
          reply: false,
          type: 'text',
          user: {
            name: message.sender,
            avatar: message.avatar==""?message.avatar:this.baseUrl+'/'+message.avatar,
          },
        });
      }
    });
  }

  sendMessage(event: any) {
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
  }
  submit(): void {
    const password = this.formGroup.value;
    this.submitted = true;
    const sendData = this.company?{...password, company: this.company}:password;
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
    this.router.navigate(['/admin/chat/rooms']);
  }

}
