export interface NewRecurringEntry {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  frequency: 'kuukausittain' | 'viikoittain';
  description: string;
}
