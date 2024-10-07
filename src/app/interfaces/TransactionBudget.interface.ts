export interface IIncome {
  id?: number;
  category: string;
  amount: number;
  date: string | null;
}

export interface IBudget {
  id?: number;
  category: string;
  budget: number;
  date: string | null;
  actualSpending?: number;
}

export interface ITransaction {
  transactionId?: number;
  category: string;
  amount: number;
  date: string | null;
  status: string;
}

export interface ITransactionCompare {
  totalCurrentExpenses: number;
  totalPreviousExpenses: number;
}
export interface IIncomeCompare {
  totalCurrentIncome: number;
  totalPreviousIncome: number;
}
