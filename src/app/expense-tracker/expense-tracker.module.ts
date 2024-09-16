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
import { MatIconModule } from '@angular/material/icon';

import { ToastrModule } from 'ngx-toastr';

import { environment } from '../../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

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
    MatIconModule,

    ToastrModule.forRoot(),

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
  ],
})
export class ExpenseTrackerModule {}
