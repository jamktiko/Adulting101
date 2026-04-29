import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, LoginResponse } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!isLoggedIn) {
      <div style="padding: 20px; max-width: 400px; margin: auto;">
        <h2>Hei! Luo tili tai kirjaudu</h2>

        @if (!showConfirm) {
          <div>
            <input [(ngModel)]="username" placeholder="Käyttäjätunnus" /> <br /><br />
            <input [(ngModel)]="email" placeholder="Sähköposti (vain rekisteröintiin)" />
            <br /><br />
            <input
              [(ngModel)]="password"
              type="password"
              placeholder="Salasana (Väh. 8 merkkiä, esim: Testi123!)"
            />
            <br /><br />

            <button (click)="signup()">Rekisteröidy</button>
            <button (click)="login()" style="margin-left: 10px;">Kirjaudu</button>
          </div>
        }

        @if (showConfirm) {
          <div style="margin-top: 20px;">
            <h3>Vahvista sähköpostiosoite</h3>
            <input [(ngModel)]="code" placeholder="Sähköpostiisi tullut koodi" /> <br /><br />
            <button (click)="confirm()">Vahvista Tili</button>
          </div>
        }

        <div style="color: red; margin-top: 10px;">{{ message }}</div>
      </div>
    }

    @if (isLoggedIn) {
      <div style="padding: 20px; color: green;">
        <h2>Olet kirjautunut sisään! 🎉</h2>
        <p>Tokenisi on tallennettu selaimeesi.</p>
        <button (click)="logout()">Kirjaudu Ulos</button>
      </div>
    }
  `,
})
export class LoginComponent {
  username = '';
  email = '';
  password = '';
  code = '';
  message = '';

  showConfirm = false;
  isLoggedIn = false;

  // Koska teit AuthServicen (auth.ts), käytetään sitä tässä eikä HttpClientiä suoraan!
  authService = inject(Auth);

  signup() {
    this.authService.signup(this.username, this.email, this.password).subscribe({
      next: () => {
        this.message = 'Onnistui! Tarkista sähköpostisi koodin varalta.';
        this.showConfirm = true;
      },
      error: (err) => (this.message = 'Virhe: ' + (err.error?.error || err.message)),
    });
  }

  confirm() {
    this.authService.confirm(this.username, this.code).subscribe({
      next: () => {
        this.message = 'Tili vahvistettu! Voit nyt kirjautua.';
        this.showConfirm = false;
      },
      error: (err) => (this.message = 'Virhe vahvistuksessa: ' + (err.error?.error || err.message)),
    });
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (tokens: LoginResponse) => {
        // Onnistunut kirjautuminen!
        this.isLoggedIn = true;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('idToken', tokens.idToken);
      },
      error: (err) =>
        (this.message = 'Virhe kirjautumisessa: ' + (err.error?.error || 'Väärä salasana/tunnus')),
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    this.isLoggedIn = false;
    this.message = 'Kirjauduttu ulos!';
  }
}
