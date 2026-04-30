import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragMove, CdkDragEnd, CdkDrag } from '@angular/cdk/drag-drop';
import { PostIt } from '../../models/post-it.model';

@Component({
  selector: 'app-post-it',
  imports: [CommonModule, CdkDrag], // <-- Add this array
  templateUrl: './post-it.component.html',
  styleUrls: ['./post-it.component.css'],
})
export class PostItComponent {
  @Input() postIt!: PostIt;
  @Input() active = false;

  @Output() dragMove = new EventEmitter<CdkDragMove>();
  @Output() dragEnd = new EventEmitter<CdkDragEnd>();
  @Output() activate = new EventEmitter<string>();

  onMove(e: CdkDragMove) {
    this.dragMove.emit(e);
  }

  onEnd(e: CdkDragEnd) {
    this.dragEnd.emit(e);
  }
}
