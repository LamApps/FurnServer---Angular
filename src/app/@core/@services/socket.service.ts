import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService extends Socket {

  public constructor() {
    const storageData = localStorage.getItem('currentUser')?JSON.parse(localStorage.getItem('currentUser')):null;
    const query = storageData?{
      "fullName": storageData.firstname+' '+storageData.lastname,
      "company": storageData.company?storageData.company.name:'Admin',
      "avatar": storageData.photo,
      "userId": storageData.id,
    }:{};
    super({
      url: environment.baseUrl,
      options: {
        query: query,
        reconnection: false,
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: 'Bearer ' + localStorage.getItem('authToken')
            }
          }
        }
      }
    });
  }
}
