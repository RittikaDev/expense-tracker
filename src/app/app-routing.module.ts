import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'expense-tracker',
    loadChildren: () =>
      import('./expense-tracker/expense-tracker-routing.module').then(
        (mod) => mod.ExpenseTrackerRoutingModule
      ),
  },
  // REDIRECT EMPTY PATH TO expense-tracker/login
  { path: '', redirectTo: 'expense-tracker/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
