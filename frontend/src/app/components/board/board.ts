import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PostItNote } from '../post-it-note/post-it-note';
// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { CdkDragMove, CdkDragEnd } from '@angular/cdk/drag-drop';
// import { PostIt } from '../../models/post-it.model';
// import { GhostComponent } from '../ghost/ghost.component';
// import { PostItComponent } from '../post-it/post-it.component';

@Component({
  selector: 'app-board',
  imports: [PostItNote],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  // title = 'Adulting 101';

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

// const GRID_SIZE = 25;
// const NOTE_SIZE = 192;
// const PADDING = 8;

// function snap(x: number, y: number, maxX: number, maxY: number) {
//   let sx = Math.round(x / GRID_SIZE) * GRID_SIZE;
//   let sy = Math.round(y / GRID_SIZE) * GRID_SIZE;

//   sx = Math.max(PADDING, Math.min(sx, maxX - NOTE_SIZE - PADDING));
//   sy = Math.max(PADDING, Math.min(sy, maxY - NOTE_SIZE - PADDING));

//   return { x: sx, y: sy };
// }

// @Component({
//   selector: 'app-board',
//   imports: [CommonModule, GhostComponent, PostItComponent], // <-- Add this array
//   templateUrl: './board.component.html',
//   styleUrls: ['./board.component.css'],
// })
// export class BoardComponent {
//   @ViewChild('board') boardRef!: ElementRef;

//   postIts: PostIt[] = [
//     {
//       id: '1',
//       title: 'Maksut',
//       text: 'Muista maksaa laskut ajoissa!',
//       color: '#FEF08A',
//       position: { x: 100, y: 150 },
//       rotation: 0,
//     },
//   ];

//   ghostPosition: { x: number; y: number } | null = null;
//   activeId: string | null = null;

//   onDragMove(event: CdkDragMove, postIt: PostIt) {
//     const rect = this.boardRef.nativeElement.getBoundingClientRect();
//     const pointer = event.pointerPosition;

//     const x = pointer.x - rect.left - NOTE_SIZE / 2;
//     const y = pointer.y - rect.top - NOTE_SIZE / 2;

//     this.ghostPosition = snap(x, y, rect.width, rect.height);
//   }

//   onDragEnd(event: CdkDragEnd, postIt: PostIt) {
//     if (!this.ghostPosition) return;

//     postIt.position = this.ghostPosition;
//     event.source.setFreeDragPosition(this.ghostPosition);

//     this.ghostPosition = null;
//   }

//   setActive(id: string) {
//     this.activeId = id;
//   }
// }
