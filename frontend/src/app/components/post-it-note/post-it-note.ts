import { Component, input, inject, output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-it-note',
  imports: [],
  templateUrl: './post-it-note.html',
  styleUrl: './post-it-note.css',
})
export class PostItNote {
  /* title, color ja route (navigointireitti) välitetään äitikomponentista */
  title = input.required<string>();
  color = input.required<string>();
  route = input<string>();
  content = input<string>();
  isDeletable = input<boolean>(false);

  deleteNote = output<void>();
  noteClick = output<void>();

  // Navigointimetodi on nyt siirretty äitikomponentin vastuulle raahauslogiikan takia.
  // Emmitoidaan vain klikkaus.
  onClick() {
    this.noteClick.emit();
  }

  onDelete(event: Event) {
    event.stopPropagation(); // Estää klikkauksen valumisen muistilapun navigointiin
    this.deleteNote.emit();
  }
}
