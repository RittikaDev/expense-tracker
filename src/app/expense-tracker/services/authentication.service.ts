import { Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';

import { updateProfile, UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ToastrService } from 'ngx-toastr';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.API_URL;

  User = signal<{ email: string; displayName: string }>({
    email: sessionStorage.getItem('email') || '',
    displayName: sessionStorage.getItem('displayName') || '',
  });

  constructor(
    private firebaseAuth: AngularFireAuth,
    public ngZone: NgZone,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  getUser = () => this.User();

  register(
    email: string,
    displayName: string,
    password: string
  ): Observable<UserCredential> {
    const promise = this.firebaseAuth
      .createUserWithEmailAndPassword(email, password)
      .then(async (userCredential: any) => {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        this.ngZone.run(() => {
          this.router.navigate(['expense-tracker/side-nav']);
        });
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('displayName', displayName);
        this.User.update(() => ({
          email,
          displayName,
        }));
        return userCredential.user.multiFactor.user;
      });

    return from(promise);
  }

  login(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      this.firebaseAuth
        .signInWithEmailAndPassword(email, password)
        .then(async (result: any) => {
          const firebaseToken = await result.user.getIdToken();

          this.http
            .post(`${this.apiUrl}authenticate`, { token: firebaseToken })
            .subscribe({
              next: (response: any) => {
                const jwtToken = response.token;
                const displayName = result.user.displayName;

                localStorage.setItem('jwtToken', jwtToken);
                sessionStorage.setItem('email', email);
                sessionStorage.setItem('displayName', displayName);

                this.User.update(() => ({
                  email,
                  displayName,
                }));

                observer.next(result.user);
                observer.complete();

                this.ngZone.run(() => {
                  this.router.navigate(['expense-tracker/side-nav']);
                });
              },
              error: (err) => {
                observer.error(err);
                this.toastr.error('Authentication failed', 'Error');
              },
            });
        })
        .catch((error) => observer.error(error));
    });
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
