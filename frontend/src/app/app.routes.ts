import { Routes } from '@angular/router';
import { Board } from './components/board/board';
import { Settings } from './components/settings/settings';
import { TopicLibrary } from './components/topic-library/topic-library';
import { Category } from './components/category/category';
import { Budgeting } from './components/budgeting/budgeting';
import { Entertainment } from './components/entertainment/entertainment';
import { LoginComponent } from './components/login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Sisäänkirjautuminen' },
  { path: 'bulletinboard', component: Board, title: 'Etusivu' },
  { path: 'settings', component: Settings, title: 'Asetukset' },
  { path: 'topics', component: TopicLibrary, title: 'Arkivinkit' },
  { path: 'topics/:category', component: Category, title: '' },
  { path: 'budgeting', component: Budgeting, title: 'Budjetti' },
  { path: 'entertainment', component: Entertainment, title: 'Viihde' },
];
