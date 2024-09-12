import { Injectable } from '@angular/core';
import { updateProfile, UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private firebaseAuth: AngularFireAuth) {}

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
}
