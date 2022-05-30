/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../../@core/@services/chat.service';
import { NbToastrService } from '@nebular/theme';
import { map, filter, takeUntil } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">Created with ♥ by <b>
      <a href="https://furnserve.com" target="_blank">FurnServe</a></b> {{ currentYear }}
    </span>
    <button nbButton matRipple 
                  status="primary" 
                  (click)="screenShare()">
                    {{shareStatus?'Stop':'Start'}} Screen Share
                </button>
  `,
})
export class FooterComponent implements OnInit {
  constructor(
    private chatService: ChatService,
    private toasterService: NbToastrService,
  ){}
  localStream;
  remoteId;
  shareStatus:boolean = false;
  private destroy$: Subject<void> = new Subject<void>();
  peerConnection;

  get currentYear(): number {
    return new Date().getFullYear();
  }
  ngOnInit() {
    
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  screenShare(){
    this.shareStatus = !this.shareStatus;
    if(this.shareStatus) this.start();
    else this.stop();
  }
  async start() {
    try {
      this.destroy$ = new Subject<void>();
      this.chatService.emit('startScreenShare', null);

      this.localStream = await this.getLocalScreenCaptureStream();
      this.localStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.shareStatus = false;
        this.stop();
      })
      this.chatService.listen('offer')
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (offerData:any) => {
        console.log(offerData)
        try{
          this.remoteId = offerData.remoteId;
          await this.initializePeerConnection(this.localStream.getTracks());
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerData.offer));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
  
          this.chatService.emit('answer', { remoteId: offerData.remoteId, answer }); 

        }catch(e){
          console.log(e);
        }
        
      });
      this.chatService.listen('iceCandidate').pipe(takeUntil(this.destroy$))
      .subscribe(async (iceData:any) => {
        console.log('iceData', iceData);
        try{
          await this.peerConnection.addIceCandidate(iceData.candidate);
        }catch(e){
          console.log(e)
        }
      });
      this.toasterService.success('', 'Started screen sharing.');
    }catch (error) {
      this.shareStatus = false;
      console.error('failed to get local media stream', error);
    }
  }
  async stop() {
    try {
      let tracks = this.localStream.getTracks();
      tracks.forEach(track => track.stop());
      this.destroy$.next();
      this.destroy$.complete();  
      this.chatService.emit('stopScreenShare', null);
      this.toasterService.danger('', 'Stopped screen sharing.');
    }catch (error) {
      console.error('failed to get local media stream', error);
    }
  }

  async getLocalScreenCaptureStream() {
    try {
      const constraints:any = { video: { cursor: 'always' }, audio: false };
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      return stream;
    } catch (error) {
      console.error('failed to get local screen', error);
    }
  };
  

  async initializePeerConnection(mediaTracks) {
    const config = { iceServers: [{ urls: [ 'stun:stun1.l.google.com:19302' ] } ] };
    this.peerConnection = new RTCPeerConnection(config);
  
    this.peerConnection.onicecandidate = ({ candidate }) => {
      console.log('candidate:', candidate);
      if (!candidate) return;
      this.chatService.emit('iceCandidate', { remoteId:this.remoteId, candidate })
    };
  
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('peerConnection::iceconnectionstatechange newState=', this.peerConnection.iceConnectionState);
      // If ICE state is disconnected stop
      if (this.peerConnection.iceConnectionState === 'disconnected') {

      }
    };
  
    for (const track of mediaTracks) {
      this.peerConnection.addTrack(track);
    }
  };
}
