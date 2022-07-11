import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpService } from '../backend/common/api/http.service';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import store from 'store2';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
    private readonly apiController: string = 'rooms';
    private readonly apiUserController: string = 'private';

    constructor(private api: HttpService, 
      private socket: SocketService,
      ) { 
    }
    connect(userCurrentValue) {
      this.socket.ioSocket.io.uri = environment.baseUrl;
      this.socket.ioSocket.io.opts.query = { 
        fullName: userCurrentValue.firstname+' '+userCurrentValue.lastname,
        company: userCurrentValue.company?userCurrentValue.company.name:'Admin',
        avatar: userCurrentValue.photo,
        userId: userCurrentValue.id,
        status: userCurrentValue.default_status,
      }
      this.socket.connect();
    }
    listen(eventName: string) {
      return this.socket.fromEvent(eventName)
    }
  
    emit(eventName: string, data:any) {
      this.socket.emit(eventName, data);
    }

    emitAndRetreive(eventName: string, data:any, callback?: (data: any)=>any) {
      this.socket.emit(eventName, data, callback);
    }

    getUserList(me:any, slug: string): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const company = me.company?me.company.id:0;
      const params = new HttpParams()
      .set('id', `${me.id}`)
      .set('cp', `${company}`)
      .set('f', `${isAdmin}`)
      .set('slug', `${slug.toLowerCase()}`)

      return this.api.get(this.apiUserController+'/get-users', { params }).pipe(
        map(data => {
          return data.items;
        })
      )
    }

    getContact(id: number): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('id', `${id}`)
      .set('f', `${isAdmin}`)

      return this.api.get(this.apiUserController+'/get-contacts', { params });
    }

    
    getChatLog(myId: number, yourId: number, yourAdmin: boolean): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('myid', `${myId}`)
      .set('myf', `${isAdmin}`)
      .set('yourid', `${yourId}`)
      .set('yourf', `${yourAdmin}`)

      return this.api.get(this.apiUserController+'/chat-log', { params });
    }

    setRead(myId: number, yourId: number, yourAdmin: boolean): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('myid', `${myId}`)
      .set('myf', `${isAdmin}`)
      .set('yourid', `${yourId}`)
      .set('yourf', `${yourAdmin}`)

      return this.api.get(this.apiUserController+'/set-read', { params });
    }

    addContact(id: number, target:any): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      return this.api.post(this.apiUserController+'/add-contacts/'+id, {isAdmin,target});
    }

    getUnreadMessages(myId: string) {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('myid', `${myId}`)
      .set('myf', `${isAdmin}`);

      return this.api.get(this.apiUserController+'/get-unread-messages', { params });
    }

    deleteContact(contactId: number): Observable<any[]> {
      const params = new HttpParams()
      .set('contactId', `${contactId}`)

      return this.api.get(this.apiUserController+'/delete-contact', { params });
    }
    
    deleteChatLog(myId: number, yourId: number, yourAdmin: boolean): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('myid', `${myId}`)
      .set('myf', `${isAdmin}`)
      .set('yourid', `${yourId}`)
      .set('yourf', `${yourAdmin}`)

      return this.api.get(this.apiUserController+'/delete-chat-log', { params });
    }

}