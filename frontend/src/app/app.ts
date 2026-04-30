import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { BoardComponent } from './components/board/board.component'; // 1. Add this import

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

// @Component({
//   selector: 'app-root',
//   imports: [BoardComponent], // 2. Add BoardComponent to the imports array
//   templateUrl: './app.html',
//   styleUrl: './app.css',
// })
// export class App {}
