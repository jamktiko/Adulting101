import { HttpClient } from '@angular/common/http'; // http-olio hakee datan
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs'; // data haetaan asynkronisesti observablena
import { Checklist } from '../models/checklist';
import { Guide } from '../models/guide';
import { NewBudgetEntry } from '../models/new-budget-entry';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Valepalvelimen eli in-memory-web-apin osoitteet. Täältä tulee sisältö arki-osion kategorioihin.
  private apiurlMoving = 'api/muutto';
  private apiurlCleaning = 'api/siivous';

  // Oikean palvelimen osoite
  private apiUrlBudget = 'api/budgets';

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
      default:
        throw new Error('Datan hakeminen epäonnistui: tuntematon kategoria');
    }
  }

  // Hae budjetti kuukaudelle
  getBudget(userId: string, month: string): Observable<any> {
    return this.http.get(`${this.apiUrlBudget}/${userId}/${month}`);
  }

  // Aseta kuukausibudjetin raja
  setBudgetLimit(userId: string, month: string, limit: number): Observable<any> {
    return this.http.patch(`${this.apiUrlBudget}/${userId}/${month}/limit`, {
      monthlyBudgetLimit: limit,
    });
  }

  // Lisää merkintä
  addEntry(userId: string, month: string, entry: NewBudgetEntry): Observable<any> {
    return this.http.post(`${this.apiUrlBudget}/${userId}/${month}/entry`, entry);
  }

  // Poista merkintä
  deleteEntry(userId: string, month: string, entryId: string): Observable<any> {
    return this.http.delete(`${this.apiUrlBudget}/${userId}/${month}/entry/${entryId}`);
  }
}
