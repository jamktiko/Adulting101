import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isLoginPage = signal(false);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(() => {
      this.isLoginPage.set(this.router.url === '/login');
    });
  }
}
