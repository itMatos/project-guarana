import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ProductApiService } from '../../../core/api/product/product-api.service';
import { Product } from '../../../shared/models/product.model';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, MatToolbarModule, MatCardModule, MatButtonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  readonly products = signal<Product[]>([]);

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService,
    private readonly productApi: ProductApiService,
  ) {}

  ngOnInit(): void {
    this.productApi.getProducts().subscribe({
      next: (products) => this.products.set(products),
      error: (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.logout();
        }
      },
    });
  }

  addToCart(product: Product): void {
    console.log('Adicionado ao carrinho:', product);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
