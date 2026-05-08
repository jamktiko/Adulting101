import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

import { provideRouter } from '@angular/router';

// provideHttpClient tarjoaa HttpClientin sovellukseen
import { provideHttpClient } from '@angular/common/http';

// seuraavat kaksi riviä tarvitaan valetietokantaa varten
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './services/in-memory-data.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // HttpClient otetaan käyttöön koko sovellukseen
    provideHttpClient(),
    // InMemoryDataService eli valetietokanta otetaan käyttöön koko sovellukseen
    // Tämä rivi poistetaan sitten, kun ryhdytään käyttämään oikeaa palvelinta.
    importProvidersFrom(InMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 500 })),
  ],
};
