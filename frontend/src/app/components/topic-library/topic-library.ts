import { Component } from '@angular/core';
import { PostItNote } from '../post-it-note/post-it-note';

@Component({
  selector: 'app-topic-library',
  imports: [PostItNote],
  templateUrl: './topic-library.html',
  styleUrl: './topic-library.css',
})
export class TopicLibrary {}
