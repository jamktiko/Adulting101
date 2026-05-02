import { Component, input, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-it-note',
  imports: [],
  templateUrl: './post-it-note.html',
  styleUrl: './post-it-note.css',
})
export class PostItNote {
  /* title, color ja route (navigointireitti) välitetään äitikomponentista (Board) 
  lapsikomponenttiin (PostItNote) */
  title = input.required<string>();
  color = input.required<string>();
  route = input.required<string>();

  // Injektoidaan Router navigointia varten
  private router = inject(Router);

  // Navigointimetodi: siirrytään siihen komponenttiin, jota vastaavaa muistilappua klikataan etusivulla
  navigate() {
    this.router.navigate([this.route()]);
  }
}
