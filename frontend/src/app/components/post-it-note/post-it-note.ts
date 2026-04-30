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

// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { CdkDragMove, CdkDragEnd, CdkDrag } from '@angular/cdk/drag-drop';
// import { PostIt } from '../../models/post-it.model';

// @Component({
//   selector: 'app-post-it',
//   imports: [CommonModule, CdkDrag], // <-- Add this array
//   templateUrl: './post-it.component.html',
//   styleUrls: ['./post-it.component.css'],
// })
// export class PostItComponent {
//   @Input() postIt!: PostIt;
//   @Input() active = false;

//   @Output() dragMove = new EventEmitter<CdkDragMove>();
//   @Output() dragEnd = new EventEmitter<CdkDragEnd>();
//   @Output() activate = new EventEmitter<string>();

//   onMove(e: CdkDragMove) {
//     this.dragMove.emit(e);
//   }

//   onEnd(e: CdkDragEnd) {
//     this.dragEnd.emit(e);
//   }
// }
