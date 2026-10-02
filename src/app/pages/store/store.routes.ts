import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';

export const STORE_ROUTES: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
];
