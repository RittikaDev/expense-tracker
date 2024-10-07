import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import {
  IBudget,
  IIncome,
  IIncomeCompare,
  ITransaction,
  ITransactionCompare,
} from '../../interfaces/TransactionBudget.interface';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionBudgetService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  // TRANSACTION SERVICES
  GetAllTransactions(userID: string | null): Observable<ITransaction[]> {
    return this.http.get<ITransaction[]>(
      `${this.apiUrl}transactions/${userID}`
    );
  }

  AddTransaction(
    userID: string | null,
    transactionData: ITransaction[]
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}transactions/${userID}`,
      transactionData
    );
  }

  GetTotalExpense(userID: string | null): Observable<ITransactionCompare> {
    return this.http.get<ITransactionCompare>(
      `${this.apiUrl}transactions/totalexpense/${userID}`
    );
  }

  // BUDGET SERVICES
  GetAllBudgets(
    userID: string | null,
    year: number,
    month: number
  ): Observable<IBudget[]> {
    return this.http.get<IBudget[]>(
      `${this.apiUrl}budgets/${userID}/${year}/${month}`
    );
  }

  AddBudget(
    budgetData: { category: string; budget: number },
    userID: string | null
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}budgets/${userID}`, budgetData);
  }

  CheckBudgetForCategory(
    userID: string | null,
    category: string,
    amount: number,
    year: number,
    month: number
  ) {
    return this.http.get(
      `${this.apiUrl}budgets/check-budget/${userID}/${category}/${amount}/${year}/${month}`
    );
  }
  // INCOME SERVICES
  GetIncomeList(
    userID: string | null,
    year: number,
    month: number
  ): Observable<IIncome[]> {
    return this.http.get<IIncome[]>(
      `${this.apiUrl}income/${userID}/${year}/${month}`
    );
  }

  AddIncome(userID: string | null, incomeData: IIncome): Observable<any> {
    return this.http.post(`${this.apiUrl}income/${userID}`, incomeData);
  }

  GetTotalIncome(userID: string | null): Observable<IIncomeCompare> {
    return this.http.get<IIncomeCompare>(
      `${this.apiUrl}income/totalincome/${userID}`
    );
  }
}
