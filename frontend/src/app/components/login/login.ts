import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, LoginResponse } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
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
