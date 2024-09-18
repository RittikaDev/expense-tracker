import { Component, effect } from '@angular/core';
import { ITheme, theme$ } from '../../../interfaces/theme-switch';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  isDropdownOpen = false;
  theme: ITheme = 'dark';

  userLoggedIn: string = '';
  userEmail: string = '';

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private spinner: NgxSpinnerService
  ) {
    effect(() => {
      const user = this.authService.getUser();
      if (user && user.displayName) {
        this.userLoggedIn = user.displayName;
        this.userEmail = user.email;
      }
    });

    console.log('User Logged In: ', this.userLoggedIn);
  }

  ngOnInit() {
    theme$.subscribe((theme) => (this.theme = theme));
  }

  // TOGGLE EVENTS
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  toggleSidebar() {
    const sidebar = document.getElementById('logo-sidebar');
    sidebar?.classList.toggle('-translate-x-full');
  }

  // NAVIGATION
  navigateToDashboard() {
    this.router.navigate(['expense-tracker/dashboard']);
  }
  navigateToHistory() {
    this.router.navigate(['expense-tracker/history']);
  }
  navigateToEarrnings() {
    this.router.navigate(['expense-tracker/earrnings']);
  }

  logOut() {
    this.authService.logOut();
  }
}
