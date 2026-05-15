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
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Auth } from '../../services/auth';
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
  private authService = inject(Auth);
  private router = inject(Router);

  private fb = inject(FormBuilder);

  // Signaalit
  userId = signal<string>('');
  selectedMonth = signal(this.getCurrentMonth());
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
    const id = this.authService.getUserIdFromToken();
    if (id) {
      this.userId.set(id);
      this.loadBudget();
      this.loadRecurringEntries();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadBudget(month?: string) {
    // this.dataService.getBudget(this.userId(), this.selectedMonth()).subscribe((budget) => {
    //   if (budget.entries) {
    //     this.entries.set(budget.entries);
    //   }
    //   this.budgetLimit.set(budget.monthlyBudgetLimit || 0);
    // });
    const monthToLoad = month || this.selectedMonth();
    this.dataService.getBudget(this.userId(), monthToLoad).subscribe((budget) => {
      if (budget.entries) {
        this.entries.set(budget.entries);
      }
      this.budgetLimit.set(budget.monthlyBudgetLimit || 0);
    });
  }

  loadRecurringEntries() {
    this.dataService
      .getRecurringEntries(this.userId())
      .subscribe((recurring) => this.recurringEntries.set(recurring));
  }

  addEntry(entry: NewBudgetEntry) {
    // this.dataService
    //   .addEntry(this.userId(), this.selectedMonth(), entry)
    //   .subscribe(() => this.loadBudget());
    const month = this.selectedMonth();
    this.dataService.addEntry(this.userId(), month, entry).subscribe(() => this.loadBudget(month));
  }

  deleteEntry(entryId: string) {
    // this.dataService
    //   .deleteEntry(this.userId(), this.selectedMonth(), entryId)
    //   .subscribe(() => this.loadBudget());
    const month = this.selectedMonth();
    this.dataService
      .deleteEntry(this.userId(), month, entryId)
      .subscribe(() => this.loadBudget(month));
  }

  addRecurringEntry(entry: NewRecurringEntry) {
    this.dataService
      .addRecurringEntry(this.userId(), entry)
      .subscribe(() => this.loadRecurringEntries());
  }

  deleteRecurringEntry(entryId: string) {
    this.dataService.deleteRecurringEntry(entryId).subscribe(() => this.loadRecurringEntries());
  }

  updateBudgetLimit(newLimit: number) {
    // this.dataService
    //   .setBudgetLimit(this.userId(), this.selectedMonth(), newLimit)
    //   .subscribe(() => this.budgetLimit.set(newLimit));
    const month = this.selectedMonth();
    this.dataService.setBudgetLimit(this.userId(), month, newLimit).subscribe(() => {
      this.budgetLimit.set(newLimit);
      this.loadBudget(month);
    });
  }

  changeMonth(direction: 'prev' | 'next') {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.selectedMonth.set(newMonth);
    this.loadBudget();
  }

  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
