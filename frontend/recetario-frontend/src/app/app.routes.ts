import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'recipes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/recipes/recipe-list.component').then((m) => m.RecipeListComponent),
  },
  { path: '**', redirectTo: 'login' },
];
