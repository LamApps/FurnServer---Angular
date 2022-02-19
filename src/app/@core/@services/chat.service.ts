import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpService } from '../backend/common/api/http.service';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as store from 'store2';
import { environment } from 'environments/environment';

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
      }
      this.socket.connect();
    }
    listen(eventName: string) {
      return this.socket.fromEvent(eventName)
    }
  
    emit(eventName: string, data:any) {
      this.socket.emit(eventName, data);
    }

    getUserList(id:number, slug: string): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('id', `${id}`)
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

    addContact(id: number, target:any): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      return this.api.post(this.apiUserController+'/add-contacts/'+id, {isAdmin,target});
    }

    setReadMessage(myId: number, yourId: number, yourAdmin: boolean): Observable<any[]> {
      const isAdmin = store.get('adminuser');
      const params = new HttpParams()
      .set('myid', `${myId}`)
      .set('myf', `${isAdmin}`)
      .set('yourid', `${yourId}`)
      .set('yourf', `${yourAdmin}`)

      return this.api.get(this.apiUserController+'/set-read', { params });
    }

    getUnreadMessages(myId: number) {
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