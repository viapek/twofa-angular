import { Component, OnInit } from '@angular/core';
import { AuthService, Person } from '../services/auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  user: Observable<Person | null>;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.user = this.authService.user;
  }

  logOut() {
    this.authService.signOut();
  }

}
