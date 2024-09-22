import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxEchartsModule } from 'ngx-echarts';

import { environment } from '../../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { ExpenseTrackerRoutingModule } from './expense-tracker-routing.module';

import { ThemeSwitchComponent } from './dashboard/theme-switch/theme-switch.component';

import { RegistrationComponent } from './authentication/registration/registration.component';
import { LoginComponent } from './authentication/login/login.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';

import { SideNavComponent } from './dashboard/side-nav/side-nav.component';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';

@NgModule({
  declarations: [
    ThemeSwitchComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    SideNavComponent,
    DashboardOverviewComponent,
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
    MatTabsModule,

    ToastrModule.forRoot(),
    NgxSpinnerModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
  ],
})
export class ExpenseTrackerModule {}
