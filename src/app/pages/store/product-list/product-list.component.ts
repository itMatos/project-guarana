import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, MatToolbarModule, MatCardModule, MatButtonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  constructor(private readonly router: Router) {}

  readonly products: Product[] = [
    { id: 1, name: 'Mochila Sauce Labs', description: 'Mochila resistente com compartimento para notebook.', price: 129.99 },
    { id: 2, name: 'Lanterna de Bicicleta', description: 'Luz LED potente para pedalar com segurança à noite.', price: 49.99 },
    { id: 3, name: 'Camiseta Sauce Labs', description: 'Camiseta de algodão macio com estampa exclusiva.', price: 15.99 },
    { id: 4, name: 'Jaqueta Fleece', description: 'Jaqueta de fleece leve e quentinha para o inverno.', price: 49.99 },
    { id: 5, name: 'Body de Bebê', description: 'Body de algodão confortável para os pequenos.', price: 7.99 },
    { id: 6, name: 'Camiseta Vermelha', description: 'Camiseta vermelha clássica com logo bordado.', price: 15.99 },
  ];

  addToCart(product: Product): void {
    console.log('Adicionado ao carrinho:', product);
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
