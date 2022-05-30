import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { ChatService } from '../../../../@core/@services/chat.service'
import { AuthenticationService } from '../../../../@core/@services/authentication.service';
import { takeWhile } from 'rxjs/operators';

export enum FormMode {
  VIEW = 'View',
  EDIT = 'Edit',
  ADD = 'Add',
} 

@Component({
  selector: 'ngx-screen-view',
  templateUrl: './screen-view.component.html',
  styleUrls: ['./screen-view.component.scss']
})
export class ScreenViewComponent implements OnInit {

  @ViewChild('remoteVideo') video:ElementRef ; 
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: NbToastrService,
    private chatService: ChatService,
    private authService: AuthenticationService,
  ) { }

  private alive = true;
  name:string;
  remoteId:string;
  peerConnection;
  localMediaStream;
  remoteMediaStream = new MediaStream();

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      if (params['data']) {
        try {
          const data = JSON.parse(decodeURI(params['data']))
          this.remoteId = data.sid
          this.name = data.name
          this.localMediaStream = await this.getLocalMediaStream();
          await this.initializePeerConnection(this.localMediaStream.getTracks());
          const offer = await this.peerConnection.createOffer();
          await this.peerConnection.setLocalDescription(offer);
          this.chatService.emit('offer', { offer, remoteId: this.remoteId });

          this.chatService.listen('answer').pipe(takeWhile(() => this.alive))
          .subscribe(async (answerData:any) => {
            console.log('answer', answerData)
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerData.answer));
          });

          this.chatService.listen('iceCandidate').pipe(takeWhile(() => this.alive))
          .subscribe(async (iceData:any) => {
            console.log('iceData', iceData)
            await this.peerConnection.addIceCandidate(iceData.candidate);
          });

        } catch (e) {
        }
      }
    });


  }
  async getLocalMediaStream  () {
    try {
      const constraints:any = { video: { cursor: 'always' }, audio: false };
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      console.log('got local media stream');
      return mediaStream;
    } catch (error) {
      console.error('failed to get local media stream', error);
    }
  };
  async initializePeerConnection(mediaTracks) {
    const config = { iceServers: [{ urls: [ 'stun:stun1.l.google.com:19302' ] } ] };
    this.peerConnection = new RTCPeerConnection(config);
  
    this.peerConnection.onicecandidate = ({ candidate }) => {
      console.log('candidate:', candidate);
      if (!candidate) return;
      this.chatService.emit('iceCandidate', { remoteId: this.remoteId, candidate })
    };
  
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('peerConnection::iceconnectionstatechange newState=', this.peerConnection.iceConnectionState);
      // If ICE state is disconnected stop
      if (this.peerConnection.iceConnectionState === 'disconnected') {
        console.log('disconnected')
      }
    };
  
    this.peerConnection.ontrack = ({ track }) => {
      console.log('track', track)
      this.remoteMediaStream.addTrack(track);
      try {
        console.log(this.video)
        this.video.nativeElement.srcObject = this.remoteMediaStream;
        this.video.nativeElement.play();
      } catch(error) {
        console.log(error)
          // this.video.nativeElement.src = URL.createObjectURL(this.remoteMediaStream);
      };
    };
  
    for (const track of mediaTracks) {
      this.peerConnection.addTrack(track);
    }
  };

  ngOnDestroy() {
    this.alive = false;
  }

}
