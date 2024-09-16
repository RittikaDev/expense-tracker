import { Injectable, NgZone } from '@angular/core';
import { updateProfile, UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private firebaseAuth: AngularFireAuth,
    public ngZone: NgZone,
    private router: Router
  ) {}

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
          this.router.navigate(['/dashboard']);
        });
        return result.user;
      })
      .catch((error) => {
        window.alert(error.message);
      });

    return from(loginPromise);
  }
}
