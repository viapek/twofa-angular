import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService} from './auth.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';
import { NotificationsService } from 'angular2-notifications';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService,
              private router: Router,
              private notify: NotificationsService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    return this.auth.user.pipe(
      take(1),
      map((user) => !!user),
      tap((loggedIn) => {
        if (!loggedIn || !this.auth.isTwoFactorAuthenticated) {
          this.notify.warn('Access denied', 'You must be authenticated to use this resource');
          this.router.navigate(['/login']);
        }
      }),
    );
  }
}
