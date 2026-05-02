import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostItNote } from '../post-it-note/post-it-note';

@Component({
  selector: 'app-board',
  imports: [PostItNote],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  // Injektoidaan Router navigointia varten
  private router = inject(Router);

  // Navigointimetodi: Asetukset-nappia klikkaamalla siirrytään Settings-komponenttiin
  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  // väliaikainen
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
