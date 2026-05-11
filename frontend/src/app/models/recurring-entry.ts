export interface RecurringEntry {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  frequency: 'monthly' | 'weekly';
  // startDate: Date;
  // endDate: Date;
  description: string;
}
