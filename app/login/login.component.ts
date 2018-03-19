import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, Person } from '../services/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  user: any;
  email: string;
  password: string;
  new2FA: Observable<any>;
  seed: string;
  seedLink: string;
  displaySeed: string;
  otp: string;
  loggingIn = false;
  verifyingOTP = false;

  subscriptions: Subscription[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.subscriptions.push(this.authService.user.subscribe(user => {
        this.user = user;
        if (user && !user.twofa) {
          this.newSeed();
        }
      })
    );
    this.subscriptions.push(this.authService.loggingIn.subscribe(val => this.loggingIn = val));
    this.subscriptions.push(this.authService.verifyingOTP.subscribe(val => this.verifyingOTP = val));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subs) => subs.unsubscribe());
  }

  newSeed() {
    this.new2FA = this.authService.generateSeed(this.user.id, this.user.email);
  }

  saveSeed() {
    this.authService.registerSeed(this.user.id, this.seed);
  }
  onSubmit() {
    this.authService.emailLogin(this.email, this.password);
  }

  resetPassword() {
    this.authService.resetPassword(this.email);
  }

  onTwoFA() {
    this.authService.twoFA(this.user.id, this.otp);
    // reset otp incase auth fails
    this.otp = '';
  }

  logout() {
    this.authService.signOut();
  }
}
