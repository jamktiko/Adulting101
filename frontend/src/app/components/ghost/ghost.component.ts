import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ghost',
  templateUrl: './ghost.component.html',
  styleUrls: ['./ghost.component.css']
})
export class GhostComponent {
  @Input() position!: { x: number; y: number };
}
