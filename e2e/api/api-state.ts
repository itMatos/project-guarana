import type { LoginRequest, LoginResponse } from '../../src/app/shared/models/auth.model';
import { MAX_QUANTITY_PER_PRODUCT, type Cart } from '../../src/app/shared/models/cart.model';
import type { Product } from '../../src/app/shared/models/product.model';

export interface Credentials {
  username: string;
  password: string;
}

const TOKEN_PREFIX = 'e2e-token-';

type Reply<T> = { status: number; body: T | { message: string } };

/**
 * Estado em memória da API falsa de um teste. Os handlers em `routes.ts` leem daqui,
 * e o teste o altera pela fixture `api` antes de navegar.
 */
export class ApiState {
  private products: Product[] = [];
  private productsFailure: number | null = null;
  /** Quantidade por id de produto, na ordem em que entraram no carrinho. */
  private cart = new Map<number, number>();
  private cartUpdatesFailure: number | null = null;

  constructor(private readonly validCredentials: Credentials) {}

  setProducts(products: Product[]): this {
    this.products = structuredClone(products);
    return this;
  }

  failProductsWith(status: number): this {
    this.productsFailure = status;
    return this;
  }

  /** Carrinho inicial; os produtos precisam estar em `setProducts`. */
  setCart(items: { productId: number; quantity: number }[]): this {
    this.cart = new Map(items.map(({ productId, quantity }) => [productId, quantity]));
    return this;
  }

  /** Faz adicionar, alterar e remover itens falharem; carregar o carrinho continua funcionando. */
  failCartUpdatesWith(status: number): this {
    this.cartUpdatesFailure = status;
    return this;
  }

  login({ username, password }: LoginRequest): { status: number; body: LoginResponse | { message: string } } {
    if (!username) {
      return { status: 400, body: { message: 'Usuário é obrigatório' } };
    }
    if (!password) {
      return { status: 400, body: { message: 'Senha é obrigatória' } };
    }
    if (username !== this.validCredentials.username || password !== this.validCredentials.password) {
      return { status: 401, body: { message: 'Usuário e senha não correspondem a nenhum usuário' } };
    }
    return { status: 200, body: { token: `${TOKEN_PREFIX}${username}`, username } };
  }

  listProducts(authorization: string | undefined): Reply<Product[]> {
    if (!this.isAuthorized(authorization)) {
      return { status: 401, body: { message: 'Não autorizado' } };
    }
    if (this.productsFailure !== null) {
      return { status: this.productsFailure, body: { message: 'Erro interno' } };
    }
    return { status: 200, body: structuredClone(this.products) };
  }

  getCart(authorization: string | undefined): Reply<Cart> {
    if (!this.isAuthorized(authorization)) {
      return { status: 401, body: { message: 'Não autorizado' } };
    }
    return { status: 200, body: this.cartBody() };
  }

  addCartItem(authorization: string | undefined, productId: number): Reply<Cart> {
    return this.updateCart(authorization, () => {
      if (!this.products.some((product) => product.id === productId)) {
        return { status: 404, body: { message: 'Produto não encontrado' } };
      }
      return this.setQuantity(productId, (this.cart.get(productId) ?? 0) + 1);
    });
  }

  updateCartItem(authorization: string | undefined, productId: number, quantity: number): Reply<Cart> {
    return this.updateCart(authorization, () => {
      if (!this.cart.has(productId)) {
        return { status: 404, body: { message: 'Produto não está no carrinho' } };
      }
      return this.setQuantity(productId, quantity);
    });
  }

  removeCartItem(authorization: string | undefined, productId: number): Reply<Cart> {
    return this.updateCart(authorization, () => {
      this.cart.delete(productId);
      return { status: 200, body: this.cartBody() };
    });
  }

  // O token só precisa ter o formato emitido pelo login: assim vale em qualquer teste, não só no que logou.
  private isAuthorized(authorization: string | undefined): boolean {
    return !!authorization?.startsWith(`Bearer ${TOKEN_PREFIX}`);
  }

  private updateCart(authorization: string | undefined, apply: () => Reply<Cart>): Reply<Cart> {
    if (!this.isAuthorized(authorization)) {
      return { status: 401, body: { message: 'Não autorizado' } };
    }
    if (this.cartUpdatesFailure !== null) {
      return { status: this.cartUpdatesFailure, body: { message: 'Erro interno' } };
    }
    return apply();
  }

  private setQuantity(productId: number, quantity: number): Reply<Cart> {
    if (quantity > MAX_QUANTITY_PER_PRODUCT) {
      return { status: 400, body: { message: `Limite de ${MAX_QUANTITY_PER_PRODUCT} unidades por produto` } };
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { status: 400, body: { message: 'Quantidade inválida' } };
    }
    this.cart.set(productId, quantity);
    return { status: 200, body: this.cartBody() };
  }

  private cartBody(): Cart {
    return {
      items: [...this.cart].flatMap(([productId, quantity]) => {
        const product = this.products.find((p) => p.id === productId);
        return product ? [{ product: structuredClone(product), quantity }] : [];
      })
    };
  }
}
