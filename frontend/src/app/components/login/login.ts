import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, LoginResponse } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  username = '';
  email = '';
  password = '';
  code = '';
  message = '';

  showConfirm = false;
  isLoggedIn = false;

  authService = inject(Auth);
  router = inject(Router);

  // Tarkistetaan heti sivun ladatessa, onko käyttäjä jo kirjautunut
  ngOnInit() {
    if (localStorage.getItem('idToken')) {
      this.router.navigate(['/bulletinboard']);
    }
  }

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
        this.isLoggedIn = true;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('idToken', tokens.idToken);

        // Onnistunut kirjautuminen -> Siirretään käyttäjä heti ilmoitustaululle
        this.router.navigate(['/bulletinboard']);
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
