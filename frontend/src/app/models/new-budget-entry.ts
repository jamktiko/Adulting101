export interface NewBudgetEntry {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  // isRecurring: boolean;
}
