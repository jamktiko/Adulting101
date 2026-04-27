import { Routes } from '@angular/router';
import { Page1 } from './page1/page1';
import { Page2 } from './page2/page2';

export const routes: Routes = [
  { path: '', redirectTo: '/page1', pathMatch: 'full' },
  { path: 'page1', component: Page1 },
  { path: 'page2', component: Page2 },
];
