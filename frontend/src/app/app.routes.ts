import { Routes } from '@angular/router';
import { Board } from './board/board';
import { Settings } from './settings/settings';
import { TopicLibrary } from './topic-library/topic-library';
import { Budgeting } from './budgeting/budgeting';

export const routes: Routes = [
  { path: '', redirectTo: '/bulletinboard', pathMatch: 'full' },
  { path: 'bulletinboard', component: Board, title: 'Etusivu' },
  { path: 'settings', component: Settings, title: 'Asetukset' },
  { path: 'topics', component: TopicLibrary, title: 'Arkivinkit' },
  { path: 'budgeting', component: Budgeting, title: 'Budjetti' },
];
