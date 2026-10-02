import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'store',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/store/store.routes').then((m) => m.STORE_ROUTES),
  },
];
