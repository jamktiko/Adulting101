import { HttpClient } from '@angular/common/http'; // http-olio hakee datan
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, EMPTY, tap } from 'rxjs';
import { Checklist } from '../models/checklist';
import { Guide } from '../models/guide';
import { NewBudgetEntry } from '../models/new-budget-entry';
import { RecurringEntry } from '../models/recurring-entry';
import { NewRecurringEntry } from '../models/new-recurring-entry';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Valepalvelimen eli in-memory-web-apin osoitteet. Täältä tulee sisältö arki-osion kategorioihin.
  private apiurlMoving = 'api/muutto';
  private apiurlCleaning = 'api/siivous';
  private apiurlFinances = 'api/talous';

  // Oikean palvelimen osoitteet
  private apiUrlBudget = 'http://localhost:3000/api/budgets';
  // private apiUrlBudget = 'https://375jfhty7h.execute-api.eu-north-1.amazonaws.com/api/budgets';
  private apiUrlBudgetR = 'http://localhost:3000/api/budgets/recurring';
  // private apiUrlBudgetR =
  //   'https://375jfhty7h.execute-api.eu-north-1.amazonaws.com/api/budgets/recurring';

  private http = inject(HttpClient);

  categoryTitle = signal('');

  getTopicData(category: string): Observable<Checklist[] | Guide[]> {
    switch (category) {
      case 'moving':
        this.categoryTitle.set('Muutto');
        return this.http.get<Checklist[]>(this.apiurlMoving);
      case 'cleaning':
        this.categoryTitle.set('Siivous');
        return this.http.get<Guide[]>(this.apiurlCleaning);
      case 'finances':
        this.categoryTitle.set('Taloudenhallinta');
        return this.http.get<Guide[]>(this.apiurlFinances);
      default:
        throw new Error('Datan hakeminen epäonnistui: tuntematon kategoria');
    }
  }

  // Hae budjetti kuukaudelle
  // toimii lokaalisti
  getBudget(userId: string, month: string): Observable<any> {
    return this.http.get(`${this.apiUrlBudget}/${userId}/${month}`);
  }

  // getBudget(userId: string, month: string): Observable<any> {
  //   return this.http.get(`${this.apiUrlBudget}/${userId}/${month}`).pipe(
  //     tap((data) => console.log('API response:', data)),
  //     catchError((err) => {
  //       console.error('API error:', err);
  //       return of([]);
  //     }),
  //   );
  // }
  // getBudget(userId: string, month: string): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrlBudget}/${userId}/${month}`).pipe(
  //     tap((data) => console.log('API response:', data)),
  //     catchError((err) => {
  //       console.error('API error:', err);
  //       return EMPTY;
  //     }),
  //   );
  // }

  // Aseta kuukausibudjetin raja
  setBudgetLimit(userId: string, month: string, limit: number) {
    return this.http.patch(`${this.apiUrlBudget}/${userId}/${month}/limit`, {
      monthlyBudgetLimit: limit,
    });
  }

  // Lisää budjettimerkintä
  addEntry(userId: string, month: string, entry: NewBudgetEntry) {
    return this.http.post(`${this.apiUrlBudget}/${userId}/${month}/entry`, entry);
  }

  // Poista budjettimerkintä
  deleteEntry(userId: string, month: string, entryId: string) {
    return this.http.delete(`${this.apiUrlBudget}/${userId}/${month}/entry/${entryId}`);
  }

  // Hae toistuvat budjettimerkinnät
  // toimii lokaalisti
  getRecurringEntries(userId: string) {
    return this.http.get<RecurringEntry[]>(`${this.apiUrlBudgetR}/${userId}`);
  }

  // getRecurringEntries(userId: string) {
  //   return this.http.get<RecurringEntry[]>(`${this.apiUrlBudgetR}/${userId}`).pipe(
  //     tap((data) => console.log('API response:', data)),
  //     catchError((err) => {
  //       console.error('API error:', err);
  //       return of([]);
  //     }),
  //   );
  // }
  // getRecurringEntries(userId: string) {
  //   return this.http.get<{ entries: RecurringEntry[] }>(`${this.apiUrlBudgetR}/${userId}`).pipe(
  //     tap((data) => console.log('API response:', data)),
  //     map((response) => response.entries), // Pura entries-taulukko
  //     tap((data) => console.log('Purettu taulukko:', data)),
  //     catchError((err) => {
  //       console.error('API error:', err);
  //       return EMPTY;
  //     }),
  //   );
  // }
  // getRecurringEntries(userId: string) {
  //   return this.http.get<any>(`${this.apiUrlBudgetR}/${userId}`).pipe(
  //     map((res) => (Array.isArray(res) ? res : (res.entries ?? []))),
  //     tap((data) => console.log('mapped recurring:', data)),
  //     catchError((err) => {
  //       console.error('API error:', err);
  //       return EMPTY;
  //     }),
  //   );
  // }

  // Lisää toistuva budjettimerkintä
  addRecurringEntry(userId: string, entry: NewRecurringEntry) {
    return this.http.post(`${this.apiUrlBudgetR}/${userId}`, entry);
  }

  // Poista toistuva budjettimerkintä
  deleteRecurringEntry(entryId: string) {
    return this.http.delete(`${this.apiUrlBudgetR}/${entryId}`);
  }
}
