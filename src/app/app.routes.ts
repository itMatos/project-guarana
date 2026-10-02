import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store.routes').then((m) => m.STORE_ROUTES),
  },
];
