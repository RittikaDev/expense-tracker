export interface ITransaction {
  transactionId?: number;
  category: string;
  amount: number;
  date: string | null;
  status: string;
}

export interface IBudget {
  id?: number;
  category: string;
  budget: number;
  date: string | null;
  actualSpending?: number;
}
