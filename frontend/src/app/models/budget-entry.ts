export interface BudgetEntry {
  _id?: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  // isRecurring: boolean;
}
