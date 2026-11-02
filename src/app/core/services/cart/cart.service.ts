import { HttpErrorResponse } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, Observable } from 'rxjs';
import { Cart, CartItem, MAX_QUANTITY_PER_PRODUCT } from '../../../shared/models/cart.model';
import { Product } from '../../../shared/models/product.model';
import { CartApiService } from '../../api/cart/cart-api.service';

export type CartStatus = 'loading' | 'ready' | 'error';

export const LIMIT_MESSAGE = `Limite de ${MAX_QUANTITY_PER_PRODUCT} unidades por produto`;
export const UPDATE_ERROR_MESSAGE = 'Não foi possível atualizar o carrinho. Tente novamente.';

/**
 * Estado do carrinho do usuário logado. A tela só muda com a resposta da API:
 * se a requisição falhar, o carrinho fica no último estado confirmado.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cart = signal<Cart>({ items: [] });

  readonly items = computed(() => this.cart().items);
  readonly status = signal<CartStatus>('loading');
  /** Há uma alteração em andamento; os controles de quantidade esperam por ela. */
  readonly pending = signal(false);
  readonly totalQuantity = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0));

  constructor(
    private readonly cartApi: CartApiService,
    private readonly snackBar: MatSnackBar
  ) {}

  /** Recarrega do zero, para não exibir o carrinho de uma sessão anterior enquanto a API responde. */
  load(): void {
    this.cart.set({ items: [] });
    this.status.set('loading');
    this.cartApi.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.status.set('ready');
      },
      error: () => this.status.set('error')
    });
  }

  add(product: Product): void {
    if (this.quantityOf(product.id) >= MAX_QUANTITY_PER_PRODUCT) {
      this.notify(LIMIT_MESSAGE);
      return;
    }
    this.update(this.cartApi.addItem(product.id), `${product.name} adicionado ao carrinho`);
  }

  increase(item: CartItem): void {
    if (item.quantity >= MAX_QUANTITY_PER_PRODUCT) {
      this.notify(LIMIT_MESSAGE);
      return;
    }
    this.update(this.cartApi.updateItem(item.product.id, item.quantity + 1));
  }

  decrease(item: CartItem): void {
    if (item.quantity <= 1) {
      return;
    }
    this.update(this.cartApi.updateItem(item.product.id, item.quantity - 1));
  }

  remove(item: CartItem): void {
    this.update(this.cartApi.removeItem(item.product.id), `${item.product.name} removido do carrinho`);
  }

  private quantityOf(productId: number): number {
    return this.items().find((item) => item.product.id === productId)?.quantity ?? 0;
  }

  private update(request: Observable<Cart>, successMessage?: string): void {
    this.pending.set(true);
    request.pipe(finalize(() => this.pending.set(false))).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.status.set('ready');
        if (successMessage) {
          this.notify(successMessage);
        }
      },
      // Só a validação (400) traz uma mensagem útil para o cliente, como o limite de unidades.
      error: (error: HttpErrorResponse) =>
        this.notify(error.status === 400 && error.error?.message ? error.error.message : UPDATE_ERROR_MESSAGE)
    });
  }

  private notify(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 4000 });
  }
}
