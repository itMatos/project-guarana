import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../../core/services/cart/cart.service';
import { MAX_QUANTITY_PER_PRODUCT } from '../../../shared/models/cart.model';
import { PRODUCT_CATEGORIES, ProductCategory } from '../../../shared/models/product.model';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  readonly cart = inject(CartService);
  readonly maxQuantity = MAX_QUANTITY_PER_PRODUCT;

  categoryLabel(category: ProductCategory): string {
    return PRODUCT_CATEGORIES.find((c) => c.id === category)?.label ?? category;
  }
}
