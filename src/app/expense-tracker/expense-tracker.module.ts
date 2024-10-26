import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';

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
import { TransactionsComponent } from './components/transactions/transactions.component';
import { BudgetComponent } from './components/budget/budget.component';
import { IncomeComponent } from './components/income/income.component';
import { TestingComponent } from './components/testing/testing.component';
import { SavingGoalComponent } from './components/saving-goal/saving-goal.component';

import { MonthPickerComponent } from './reusable-components/month-picker/month-picker.component';
import { MonthRangePickerComponent } from './reusable-components/month-range-picker/month-range-picker.component';
import { ReportsComponent } from './components/reports/reports.component';

@NgModule({
  declarations: [
    ThemeSwitchComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    SideNavComponent,
    DashboardOverviewComponent,
    TransactionsComponent,
    BudgetComponent,
    IncomeComponent,
    MonthPickerComponent,
    MonthRangePickerComponent,
    TestingComponent,
    SavingGoalComponent,
    ReportsComponent,
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
    MatDatepickerModule,
    MatNativeDateModule,

    jqxGridModule,

    ToastrModule.forRoot(),
    NgxSpinnerModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
  ],
  providers: [DatePipe],
})
export class ExpenseTrackerModule {}
