import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  IBudget,
  ITransaction,
} from '../../interfaces/TransactionBudget.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionBudgetService {
  private apiUrl = environment.API_URL;

  constructor(private http: HttpClient) {}

  // BUDGET SERVICES
  GetAllBudgets(): Observable<IBudget[]> {
    return this.http.get<IBudget[]>(`${this.apiUrl}budgets`);
  }

  AddBudget(budgetData: { category: string; budget: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}budgets`, budgetData);
  }

  // TRANSACTION SERVICES
  GetAllTransactions(): Observable<ITransaction[]> {
    return this.http.get<ITransaction[]>(`${this.apiUrl}transactions`);
  }

  AddTransaction(transactionData: ITransaction[]): Observable<any> {
    return this.http.post(`${this.apiUrl}transactions`, transactionData);
  }

  CheckBudgetForCategory(
    category: string,
    amount: number,
    year: number,
    month: number
  ) {
    return this.http.get(
      `${this.apiUrl}budgets/check-budget/${category}/${amount}/${year}/${month}`
    );
  }

  // TRANSACTIONS SERVICE
  private transactionSubject = new BehaviorSubject<ITransaction[]>([]);
  transactions$ = this.transactionSubject.asObservable();

  addTransaction(transaction: ITransaction) {
    const currentTransactions = this.transactionSubject.value;
    this.transactionSubject.next([...currentTransactions, transaction]);
  }

  getActualSpendingByCategory(category: string): number {
    return this.transactionSubject.value
      .filter((transaction) => transaction.category === category)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  // BUDGET SERVICES
  private budgetOverrunSubject = new BehaviorSubject<{
    message: string;
    isOverrun: boolean;
  }>({ message: '', isOverrun: false });
  budgetOverrun$ = this.budgetOverrunSubject.asObservable();

  private budgetsSubject = new BehaviorSubject<IBudget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  addBudget(budget: IBudget) {
    const currentBudgets = this.budgetsSubject.value;
    this.budgetsSubject.next([...currentBudgets, budget]);
  }

  getBudgets(): IBudget[] {
    return this.budgetsSubject.value;
  }

  checkBudgetOverrun(transaction: ITransaction) {
    const budgets = this.getBudgets(); // Retrieve budgets
    const actualSpending = this.getActualSpendingForCategory(
      transaction.category
    ); // Get actual spending

    const categoryBudget = budgets.find(
      (b) => b.category === transaction.category
    );
    if (categoryBudget) {
      const newActualSpending = actualSpending + transaction.amount;
      if (newActualSpending > categoryBudget.budget) {
        this.budgetOverrunSubject.next({
          message: `Budget for ${transaction.category} exceeded!`,
          isOverrun: true,
        });
      }
    } else {
      const totalSpent = budgets.reduce(
        (sum, budget) =>
          sum + this.getActualSpendingForCategory(budget.category),
        0
      );
      const totalBudget = budgets.reduce(
        (sum, budget) => sum + budget.budget,
        0
      );
      if (totalSpent > totalBudget) {
        this.budgetOverrunSubject.next({
          message: `Total budget exceeded! Total spent: ${totalSpent}`,
          isOverrun: true,
        });
      }
    }
  }

  getActualSpendingForCategory(category: string): number {
    const transactionsForCategory = this.transactionSubject.value.filter(
      (transaction) => transaction.category === category
    );

    return transactionsForCategory.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );
  }
}
