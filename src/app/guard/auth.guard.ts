import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { jwtDecode } from 'jwt-decode';

import { AuthenticationService } from '../expense-tracker/services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const jwtToken = sessionStorage.getItem('jwtToken');

    if (jwtToken && this.isTokenValid(jwtToken)) return true;
    else {
      this.authService.logOut();
      this.router.navigate(['expense-tracker/login']);
      return false;
    }
  }

  // VALIDATE TOKEN
  private isTokenValid(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp * 1000).getTime();
      const currentDate = new Date().getTime();
      return expirationDate > currentDate;
    } catch (error) {
      return false;
    }
  }
}
