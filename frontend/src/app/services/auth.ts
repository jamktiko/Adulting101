import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

// Luodaan interfacen kirjautumisen palauttamille tokeneille
export interface LoginResponse {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface GenericResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'https://375jfhty7h.execute-api.eu-north-1.amazonaws.com';

  signup(username: string, email: string, password: string): Observable<GenericResponse> {
    return from(
      fetch(`${this.apiUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      }).then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      }),
    );
  }

  confirm(username: string, code: string): Observable<GenericResponse> {
    return from(
      fetch(`${this.apiUrl}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code }),
      }).then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err));
        return res.json();
      }),
    );
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return from(
      fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }).then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject({ error: err })); // format as {error: err} to match component expectations
        return res.json();
      }),
    );
  }
}
