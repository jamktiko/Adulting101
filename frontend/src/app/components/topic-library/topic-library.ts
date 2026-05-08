import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostItNote } from '../post-it-note/post-it-note';
import { RouterLink } from '@angular/router';

interface TopicNote {
  title: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-topic-library',
  imports: [PostItNote, RouterLink],
  templateUrl: './topic-library.html',
  styleUrl: './topic-library.css',
})
export class TopicLibrary {
  private router = inject(Router);

  topicNotes: TopicNote[] = [
    { title: 'Muutto', color: '#a183ff', route: '/topics/moving' },
    { title: 'Siivous', color: '#fd82b6', route: '/topics/cleaning' },
    { title: 'Talouden-hallinta', color: '#ff9d5c', route: '/topics/finances' },
  ];

  handleNoteClick(note: TopicNote) {
    this.router.navigate([note.route]);
  }
}
