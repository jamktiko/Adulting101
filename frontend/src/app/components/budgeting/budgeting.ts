import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { DataService } from '../../services/data.service';
import { BudgetEntry } from '../../models/budget-entry';

@Component({
  selector: 'app-budgeting',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './budgeting.html',
  styleUrl: './budgeting.css',
})
export class Budgeting implements OnInit {
  private dataService = inject(DataService);

  // Signaalit
  currentMonth = signal(this.getCurrentMonth());
  budgetLimit = signal(0);
  entries = signal<BudgetEntry[]>([]);

  // Lasketut arvot
  totalIncome = computed(() =>
    this.entries().reduce((sum, e) => (e.type === 'income' ? sum + e.amount : sum), 0),
  );

  totalExpenses = computed(() =>
    this.entries().reduce((sum, e) => (e.type === 'expense' ? sum + e.amount : sum), 0),
  );

  balance = computed(() => this.totalIncome() - this.totalExpenses());

  budgetPercentage = computed(() => {
    const limit = this.budgetLimit();
    return limit > 0 ? (this.totalExpenses() / limit) * 100 : 0;
  });

  ngOnInit() {
    this.loadBudget();
  }

  loadBudget() {
    // Korvaa 'user123' todellisella userId:lla (auth-palvelusta)
    this.dataService.getBudget('user123', this.currentMonth()).subscribe((budget) => {
      if (budget.entries) {
        this.entries.set(budget.entries);
      }
      this.budgetLimit.set(budget.monthlyBudgetLimit || 0);
    });
  }

  addEntry(entry: BudgetEntry) {
    this.dataService
      .addEntry('user123', this.currentMonth(), entry)
      .subscribe(() => this.loadBudget());
  }

  deleteEntry(entryId: string) {
    this.dataService
      .deleteEntry('user123', this.currentMonth(), entryId)
      .subscribe(() => this.loadBudget());
  }

  updateBudgetLimit(newLimit: number) {
    this.dataService
      .setBudgetLimit('user123', this.currentMonth(), newLimit)
      .subscribe(() => this.budgetLimit.set(newLimit));
  }

  changeMonth(direction: 'prev' | 'next') {
    const [year, month] = this.currentMonth().split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.currentMonth.set(newMonth);
    this.loadBudget();
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
