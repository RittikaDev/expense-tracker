import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ExpenseTrackerRoutingModule } from './expense-tracker-routing.module';
import { ThemeSwitchComponent } from './dashboard/theme-switch/theme-switch.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { LoginComponent } from './authentication/login/login.component';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ThemeSwitchComponent, LoginComponent, RegistrationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ExpenseTrackerRoutingModule,

    MatButtonModule,
    MatInputModule,
  ],
})
export class ExpenseTrackerModule {}
