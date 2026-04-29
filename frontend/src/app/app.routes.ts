import { Routes } from '@angular/router';
import { Board } from './components/board/board';
import { Settings } from './components/settings/settings';
import { TopicLibrary } from './components/topic-library/topic-library';
import { Budgeting } from './components/budgeting/budgeting';
import { Entertainment } from './components/entertainment/entertainment';
import { LoginComponent } from './components/login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/bulletinboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Sisäänkirjautuminen' },
  { path: 'bulletinboard', component: Board, title: 'Etusivu' },
  { path: 'settings', component: Settings, title: 'Asetukset' },
  { path: 'topics', component: TopicLibrary, title: 'Arkivinkit' },
  { path: 'budgeting', component: Budgeting, title: 'Budjetti' },
  { path: 'entertainment', component: Entertainment, title: 'Viihde' },
];
