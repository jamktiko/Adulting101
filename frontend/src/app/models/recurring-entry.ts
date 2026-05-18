export interface RecurringEntry {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  frequency: 'kuukausittain' | 'viikoittain';
  description: string;
}
