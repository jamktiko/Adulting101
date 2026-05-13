// Funktionaalinen guard, jolla suojataan reitti kirjautumattomilta käyttäjiltä

import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function loginGuard(): boolean {
  const hasToken = !!localStorage.getItem('idToken');

  if (hasToken) {
    return true;
  } else {
    inject(Router).navigate(['/login']);
    return false;
  }
}
