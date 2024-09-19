import { Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';

import { updateProfile, UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  User = signal<{ email: string; displayName: string }>({
    email: sessionStorage.getItem('email') || '',
    displayName: sessionStorage.getItem('displayName') || '',
  });

  constructor(
    private firebaseAuth: AngularFireAuth,
    public ngZone: NgZone,
    private router: Router,
    private toastr: ToastrService
  ) {}

  getUser = () => this.User();

  register(
    email: string,
    displayName: string,
    password: string
  ): Observable<UserCredential> {
    const promise = this.firebaseAuth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential: any) => {
        return updateProfile(userCredential.user, {
          displayName: displayName,
        }).then(() => {
          this.ngZone.run(() => {
            this.router.navigate(['expense-tracker/side-nav']);
          });
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('displayName', displayName);
          this.User.update(() => ({ email, displayName }));
          return userCredential.user.multiFactor.user;
        });
      });

    return from(promise);
  }

  login(email: string, password: string): any {
    const loginPromise = this.firebaseAuth
      .signInWithEmailAndPassword(email, password)
      .then((result: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['expense-tracker/side-nav']);
        });
        const displayName = result.user.displayName;
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('displayName', displayName);
        this.User.update(() => ({ email, displayName }));
        return result.user;
      })
      .catch((error) => {
        window.alert(error.message);
      });

    return from(loginPromise);
  }

  forgotPassword(email: string) {
    this.firebaseAuth.sendPasswordResetEmail(email).then(
      () =>
        this.toastr.info(
          'Please check your email to reset password',
          'Information'
        ),
      () => this.toastr.error('Failed to reset password', 'Error')
    );
  }

  logOut() {
    this.firebaseAuth.signOut().then(
      () => {
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('displayName');
        this.ngZone.run(() => {
          this.router.navigate(['expense-tracker/login']);
        });
      },
      (err) => this.toastr.error(err.message)
    );
  }
}
