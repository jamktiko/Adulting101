import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private http = inject(HttpClient);
  private apiUrl = 'https://375jfhty7h.execute-api.eu-north-1.amazonaws.com/api';

  signup(username: string, email: string, password: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.apiUrl}/signup`, { username, email, password });
  }

  confirm(username: string, code: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.apiUrl}/confirm`, { username, code });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password });
  }
}
