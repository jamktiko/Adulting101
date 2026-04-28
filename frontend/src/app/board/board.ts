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
  title = 'Adulting 101';

  private router = inject(Router);

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
}
