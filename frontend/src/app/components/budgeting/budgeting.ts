import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { BudgetEntry } from '../../models/budget-entry';
import { NewBudgetEntry } from '../../models/new-budget-entry';
import { RecurringEntry } from '../../models/recurring-entry';
import { NewRecurringEntry } from '../../models/new-recurring-entry';

@Component({
  selector: 'app-budgeting',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './budgeting.html',
  styleUrl: './budgeting.css',
})
export class Budgeting implements OnInit {
  private dataService = inject(DataService);

  private fb = inject(FormBuilder);

  // Signaalit
  currentMonth = signal(this.getCurrentMonth());
  budgetLimit = signal(0);
  entries = signal<BudgetEntry[]>([]);
  recurringEntries = signal<RecurringEntry[]>([]);

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

  // Lomakkeen FormGroup
  entryForm = this.fb.group({
    mode: ['single', Validators.required],
    type: ['expense', Validators.required],
    category: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    frequency: ['monthly'],
    // startDate: [new Date().toISOString().split('T')[0]],
    // endDate: [''],
  });

  submitEntry() {
    if (!this.entryForm.valid) return;

    const formValue = this.entryForm.value;

    if (formValue.mode === 'single') {
      const entry: NewBudgetEntry = {
        type: formValue.type as 'income' | 'expense',
        category: formValue.category!,
        amount: Number(formValue.amount),
        description: formValue.description || '',
        date: new Date(formValue.date!),
      };
      this.addEntry(entry);
    } else {
      const recurring: NewRecurringEntry = {
        type: formValue.type as 'income' | 'expense',
        category: formValue.category!,
        amount: Number(formValue.amount),
        description: formValue.description || '',
        frequency: formValue.frequency as 'monthly' | 'weekly',
        // startDate: formValue.startDate,
        // endDate: formValue.endDate || undefined,
      };
      this.addRecurringEntry(recurring);
    }

    this.entryForm.reset({
      mode: 'single',
      type: 'expense',
      category: '',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'monthly',
      // startDate: new Date().toISOString().split('T')[0],
      // endDate: '',
    });
  }

  ngOnInit() {
    this.loadBudget();
    this.loadRecurringEntries();
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

  loadRecurringEntries() {
    this.dataService
      .getRecurringEntries('user123')
      .subscribe((recurring) => this.recurringEntries.set(recurring));
  }

  addEntry(entry: NewBudgetEntry) {
    this.dataService
      .addEntry('user123', this.currentMonth(), entry)
      .subscribe(() => this.loadBudget());
  }

  deleteEntry(entryId: string) {
    this.dataService
      .deleteEntry('user123', this.currentMonth(), entryId)
      .subscribe(() => this.loadBudget());
  }

  addRecurringEntry(entry: NewRecurringEntry) {
    this.dataService
      .addRecurringEntry('user123', entry)
      .subscribe(() => this.loadRecurringEntries());
  }

  deleteRecurringEntry(entryId: string) {
    this.dataService.deleteRecurringEntry(entryId).subscribe(() => this.loadRecurringEntries());
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
