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
  isButtonVisible: boolean = false;

  theme: ITheme = 'dark';

  userLoggedIn: string = '';
  userEmail: string = '';

  commonUrl: string = 'expense-tracker/side-nav/';

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
    console.log('Clicked');
    this.router.navigate([`${this.commonUrl}dashboard`]);
  }
  navigateToTransactions() {
    this.router.navigate([`${this.commonUrl}transactions`]);
  }
  navigateToBudget() {
    this.router.navigate([`${this.commonUrl}budget`]);
  }

  logOut() {
    this.authService.logOut();
  }

  isIcon1Active = false;
  isIcon2Active = false;
  isIcon3Active = false;

  toggleMenu() {
    this.isIcon1Active = !this.isIcon1Active;
    this.isIcon2Active = !this.isIcon2Active;
    this.isIcon3Active = !this.isIcon3Active;
    this.isButtonVisible = true;
    this.toggleSidebar();
  }
}
