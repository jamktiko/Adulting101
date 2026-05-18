import { Routes } from '@angular/router';
import { Board } from './components/board/board';
import { Settings } from './components/settings/settings';
import { TopicLibrary } from './components/topic-library/topic-library';
import { Category } from './components/category/category';
import { Budgeting } from './components/budgeting/budgeting';
// import { Entertainment } from './components/entertainment/entertainment';
import { LoginComponent } from './components/login/login';
import { loginGuard } from './login.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Sisäänkirjautuminen' },
  { path: 'bulletinboard', component: Board, canActivate: [loginGuard], title: 'Etusivu' },
  { path: 'settings', component: Settings, canActivate: [loginGuard], title: 'Asetukset' },
  { path: 'topics', component: TopicLibrary, canActivate: [loginGuard], title: 'Arkivinkit' },
  { path: 'topics/:category', component: Category, canActivate: [loginGuard], title: 'Arkivinkit' },
  { path: 'budgeting', component: Budgeting, canActivate: [loginGuard], title: 'Budjetti' },
  // { path: 'entertainment', component: Entertainment, canActivate: [loginGuard], title: 'Viihde' },
];
