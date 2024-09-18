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
import { NgxSpinnerModule } from 'ngx-spinner';

import { environment } from '../../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { SideNavComponent } from './dashboard/side-nav/side-nav.component';

@NgModule({
  declarations: [
    ThemeSwitchComponent,
    LoginComponent,
    RegistrationComponent,
    SideNavComponent,
  ],
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
    NgxSpinnerModule.forRoot(),

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
  ],
})
export class ExpenseTrackerModule {}
