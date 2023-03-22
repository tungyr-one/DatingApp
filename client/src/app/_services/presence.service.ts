import { environment } from 'src/environments/environment';
import { Injectable, OnInit } from '@angular/core';
import { HubConnection } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { HubConnectionBuilder } from '@microsoft/signalr/dist/esm/HubConnectionBuilder';
import { User } from '../_models/user';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private onLineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onLineUsersSource.asObservable();

  constructor(private toastr:ToastrService, private router: Router) { }

  createHubConnecion(user: User){
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + 'presence', {
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('UserIsOnline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => this.onLineUsersSource.next([...usernames, username])
      })
    })

    this.hubConnection.on('UserIsOffline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => this.onLineUsersSource.next(usernames.filter(x => x !== username))
      })
    })

    this.hubConnection.on('GetOnlineUsers', usernames => {
      this.onLineUsersSource.next(usernames);
    })

    this.hubConnection.on('NewMessageReceived', ({username, knownAs}) => {
      this.toastr.info(knownAs + ' has sent you a new message! Click me to see it')
      .onTap
      .pipe(take(1))
      .subscribe({
        next: () => this.router.navigateByUrl('/members/' + username + '?tab=Messages')
      })
    })
  }

  stopHubConnection(){
    this.hubConnection.stop().catch(error => console.log(error));
  }
}
