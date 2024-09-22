import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// AUTHENTICATION
import { LoginComponent } from './authentication/login/login.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';

// MAIN COMPONENTS
import { SideNavComponent } from './dashboard/side-nav/side-nav.component';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'forgot-pass', component: ForgotPasswordComponent },
  {
    path: 'side-nav',
    component: SideNavComponent,
    children: [
      { path: 'dashboard', component: DashboardOverviewComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseTrackerRoutingModule {}
