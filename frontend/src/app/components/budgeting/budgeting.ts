import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
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
    category: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        this.noSpecialChars.bind(this),
      ],
    ],
    amount: [0, [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
    description: ['', Validators.maxLength(250)],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    frequency: ['monthly', Validators.required],
  });

  noSpecialChars(control: AbstractControl): ValidationErrors | null {
    // Salli vain kirjaimet, numerot, välilyönnit ja yhdysviivat
    const regex = /^[a-zA-Z0-9\sä-ö-]*$/;
    return regex.test(control.value) ? null : { specialChars: true };
  }

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
