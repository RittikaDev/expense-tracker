import { Component } from '@angular/core';
import { ITheme, theme$ } from '../../../interfaces/theme-switch';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  isDropdownOpen = false;

  theme: ITheme = 'dark';
  constructor(private router: Router) {}

  ngOnInit() {
    theme$.subscribe((theme) => {
      console.log(theme);
      this.theme = theme;
    });
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
  navigateToLogOut() {
    this.router.navigate(['expense-tracker/logOut']);
  }
}
