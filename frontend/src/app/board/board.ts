import { Component } from '@angular/core';
import { PostItNote } from '../post-it-note/post-it-note';

@Component({
  selector: 'app-board',
  imports: [PostItNote],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  title = 'Adulting 101';
}
