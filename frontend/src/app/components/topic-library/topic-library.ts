import { Component } from '@angular/core';
import { PostItNote } from '../post-it-note/post-it-note';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-topic-library',
  imports: [PostItNote, RouterLink],
  templateUrl: './topic-library.html',
  styleUrl: './topic-library.css',
})
export class TopicLibrary {}
