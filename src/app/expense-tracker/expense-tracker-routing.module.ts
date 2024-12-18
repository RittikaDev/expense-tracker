import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// AUTHENTICATION
import { LoginComponent } from './authentication/login/login.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';

// MAIN COMPONENTS
import { SideNavComponent } from './dashboard/side-nav/side-nav.component';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { BudgetComponent } from './components/budget/budget.component';
import { AuthGuard } from '../guard/auth.guard';
import { IncomeComponent } from './components/income/income.component';
import { TestingComponent } from './components/testing/testing.component';
import { SavingGoalComponent } from './components/saving-goal/saving-goal.component';
import { ReportsComponent } from './components/reports/reports.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'forgot-pass', component: ForgotPasswordComponent },
  {
    path: 'side-nav',
    component: SideNavComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardOverviewComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'income',
        component: IncomeComponent,
        canActivate: [AuthGuard],
        data: { title: 'Income Setup' },
      },
      {
        path: 'budget',
        component: BudgetComponent,
        canActivate: [AuthGuard],
        data: { title: 'Budget' },
      },
      {
        path: 'transactions',
        component: TransactionsComponent,
        // component: TestingComponent,
        canActivate: [AuthGuard],
        data: { title: 'Transactions' },
      },
      {
        path: 'goal',
        component: SavingGoalComponent,
        canActivate: [AuthGuard],
        data: { title: 'Saving Goals' },
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [AuthGuard],
        data: { title: 'Reports' },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseTrackerRoutingModule {}
