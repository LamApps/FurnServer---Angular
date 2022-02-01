import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/@core/@services/authentication.service';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user;
  today;

  constructor(private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.today = new Date();
  }
}
