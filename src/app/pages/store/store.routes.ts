import { Routes } from '@angular/router';
import { CartComponent } from './cart/cart.component';
import { ProductListComponent } from './product-list/product-list.component';
import { StoreLayoutComponent } from './store-layout/store-layout.component';

export const STORE_ROUTES: Routes = [
  {
    path: '',
    component: StoreLayoutComponent,
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: ProductListComponent },
      { path: 'cart', component: CartComponent }
    ]
  }
];
