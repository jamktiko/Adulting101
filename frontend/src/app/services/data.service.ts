import { HttpClient } from '@angular/common/http'; // http-olio hakee datan
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs'; // data haetaan asynkronisesti observablena
import { Checklist } from '../models/checklist';
import { Guide } from '../models/guide';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Valepalvelimen eli in-memory-web-apin osoitteet. Täältä data tulee.
  private apiurlMoving = 'api/muutto';
  private apiurlCleaning = 'api/siivous';

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
}
