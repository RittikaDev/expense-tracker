export interface ISavingsGoal {
  userId: string | null;
  goalValue: number;
  purpose: string;
  startDate: string | null;
  endDate: string | null;
}
