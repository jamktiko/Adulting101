import { HttpClient } from '@angular/common/http'; // http-olio hakee datan
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // data haetaan asynkronisesti observablena
// import { catchError } from 'rxjs/operators'; // virheenkäsittelyä varten
import { Checklist } from '../models/checklist';
import { Guide } from '../models/guide';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiurlMoving = 'api/muutto'; // valepalvelimen eli in-memory-web-apin osoite. täältä data tulee.
  private apiurlCleaning = 'api/siivous';

  private http = inject(HttpClient);

  // Haetaan observablena koko muutto-taulukko
  getMovingData(): Observable<Checklist[]> {
    return this.http.get<Checklist[]>(this.apiurlMoving);
  }

  // Haetaan observablena koko siivous-taulukko
  getCleaningData(): Observable<Guide[]> {
    return this.http.get<Guide[]>(this.apiurlCleaning);
  }
}
