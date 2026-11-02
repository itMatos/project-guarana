import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { map } from 'rxjs';
import { ProductApiService } from '../../../core/api/product/product-api.service';
import { Product, PRODUCT_CATEGORIES } from '../../../shared/models/product.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CartService } from '../../../core/services/cart/cart.service';

/** Query param que guarda a aba ativa, para a categoria sobreviver ao F5 e poder ser linkada. */
const CATEGORY_PARAM = 'categoria';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, MatTabsModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly productApi = inject(ProductApiService);
  private readonly cart = inject(CartService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly productsByCategory = computed(() =>
    PRODUCT_CATEGORIES.map((category) => ({
      ...category,
      products: this.products().filter((product) => product.category === category.id)
    }))
  );

  private readonly categoryParam = toSignal(this.route.queryParamMap.pipe(map((params) => params.get(CATEGORY_PARAM))), {
    initialValue: null
  });

  /** Índice da aba ativa; categoria desconhecida ou ausente cai na primeira aba. */
  readonly selectedIndex = computed(() =>
    Math.max(
      0,
      PRODUCT_CATEGORIES.findIndex((category) => category.id === this.categoryParam())
    )
  );

  ngOnInit(): void {
    this.productApi.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        if (error.status === 401) {
          this.logout();
        }
      }
    });
  }

  selectCategory(index: number): void {
    const category = PRODUCT_CATEGORIES[index];
    if (!category) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [CATEGORY_PARAM]: category.id },
      replaceUrl: true
    });
  }

  addToCart(product: Product): void {
    this.cart.add(product);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
