import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// AUTHENTICATION
import { LoginComponent } from './authentication/login/login.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { SideNavComponent } from './dashboard/side-nav/side-nav.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'side-nav', component: SideNavComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseTrackerRoutingModule {}
