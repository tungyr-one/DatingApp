import { environment } from 'src/environments/environment';
import { Injectable, OnInit } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { HubConnectionBuilder } from '@microsoft/signalr/dist/esm/HubConnectionBuilder';
import { User } from '../_models/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onLineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onLineUsersSource.asObservable();

  constructor(private toastr:ToastrService) { }

  createHubConnecion(user: User){
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + 'presence', {
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('UserIsOnline', username => {
      this.toastr.info(username + ' has connected');
    })

    this.hubConnection.on('UserIsOffline', username => {
      this.toastr.warning(username + ' has disconnected')
    })

    this.hubConnection.on('GetOnlineUsers', usernames => {
      this.onLineUsersSource.next(usernames);
    })
  }

  stopHubConnection(){
    this.hubConnection.stop().catch(error => console.log(error));
  }
}
