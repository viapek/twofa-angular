import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as firebase from 'firebase/app';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';

import { NotificationsService } from 'angular2-notifications';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface Person {
  id: string;
  name: string;
  email: string;
  twofa: boolean;
}


@Injectable()
export class AuthService {

  httpOptions = {};

  isTwoFactorAuthenticated = false;
  verifyingOTP = new BehaviorSubject<boolean>(false);
  loggingIn = new BehaviorSubject<boolean>(false);
  currentUserId: string;
  verifyOTPUrl = '<< URL TO CLOUD FUNCTION >>';
  generateSecretUrl = '<< URL TO CLOUD FUNCTION >>';

  user: Observable<Person | null>;

  constructor(private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private router: Router,
              private notify: NotificationsService,
              private http: HttpClient
            ) {

    this.user = this.afAuth.authState
      .switchMap((user) => {
        if (user) {
          this.currentUserId = user.uid;
          this.afAuth.auth.currentUser.getIdToken().then((idToken) => {

            this.httpOptions = { headers: new HttpHeaders({'Authorization': idToken}) };

            const payload = JSON.parse(this.b64DecodeUnicode(idToken.split('.')[1]));
            if (payload.twoFactorAuthenticated) {
              this.isTwoFactorAuthenticated = true;
            } else {
              this.isTwoFactorAuthenticated = false;
            }
          });
          return this.afs.doc<Person>(`persons/${user.uid}`).valueChanges();
        } else {
          return Observable.of(null);
        }
      });
  }

  //// Email/Password Auth ////
  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .catch((error) => this.notify.error('Login failure', error.message) );
  }

  twoFA(userId, otp) {
    this.verifyingOTP.next(true);
    const payload = {
      uid: userId, token: otp
    };
    this.http.post(this.verifyOTPUrl, payload)
      .subscribe(
        res => {
          this.verifyingOTP.next(false);
          this.loggingIn.next(true);
          this.afAuth.auth.signInWithCustomToken(res['token']).then(() => {
            this.router.navigate(['/']);
            setTimeout(() => { this.loggingIn.next(false); }, 500);
          });
        },
        error => {
          this.verifyingOTP.next(false);
          this.notify.error('Two Factor Authentication Failed', 'Unable to authenticate with the one time password provided.');
        });
  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = firebase.auth();

    return fbAuth.sendPasswordResetEmail(email)
      .then(() => this.notify.success('Password reset sent', 'Please check you email address for further instructions'))
      .catch((error) => this.notify.error('Error resetting password', error));
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
        this.notify.success('Logout success', 'Thanks for playing... Bye!!');
        this.router.navigate(['/login']);
    });
  }

  generateSeed(uid: string, email: string) {
    return this.http.post(this.generateSecretUrl, { uid: uid, email: email }, this.httpOptions);
  }

  registerSeed(uid: string, seed: string) {
    this.afs.doc(`persons/${uid}`).update({
      twofa: {
          certified: true,
          createdAt: Date.now()
      }
  });
  }

  private b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
}
