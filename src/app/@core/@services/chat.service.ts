import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { DataSource } from 'ng2-smart-table/lib/lib/data-source/data-source';
import { HttpService } from '../backend/common/api/http.service';
import { AuthenticationService } from './authentication.service'
import { Observable } from 'rxjs'; 
import { Socket } from 'ngx-socket-io';
  
@Injectable({ providedIn: 'root' })
export class ChatService {
    private readonly apiController: string = 'rooms';

    constructor(private api: HttpService, 
      private socket: Socket,
      private authService: AuthenticationService) { 
    }
    listen(eventName: string) {
      return this.socket.fromEvent(eventName)
    }
  
    emit(eventName: string, data:any) {
      this.socket.emit(eventName, data);
    }
}