import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CartService } from '../../../core/services/cart/cart.service';

/** Cabeçalho comum às páginas da loja: carrega o carrinho uma vez para todas elas. */
@Component({
  selector: 'app-store-layout',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './store-layout.component.html',
  styleUrl: './store-layout.component.scss'
})
export class StoreLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly cart = inject(CartService);

  ngOnInit(): void {
    this.cart.load();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
