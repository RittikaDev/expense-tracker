import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const jwtToken = localStorage.getItem('jwtToken');

    if (jwtToken) {
      return true;
    } else {
      this.router.navigate(['expense-tracker/login']);
      return false;
    }
  }
}
