import { Routes } from '@angular/router';
import { Board } from './board/board';

export const routes: Routes = [
  { path: '', redirectTo: '/bulletinboard', pathMatch: 'full' },
  { path: 'bulletinboard', component: Board, title: 'Etusivu' },
];
