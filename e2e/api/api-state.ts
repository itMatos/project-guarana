import type { LoginRequest, LoginResponse } from '../../src/app/shared/models/auth.model';
import type { Product } from '../../src/app/shared/models/product.model';

export interface Credentials {
  username: string;
  password: string;
}

const TOKEN_PREFIX = 'e2e-token-';

/**
 * Estado em memória da API falsa de um teste. Os handlers em `routes.ts` leem daqui,
 * e o teste o altera pela fixture `api` antes de navegar.
 */
export class ApiState {
  private products: Product[] = [];
  private productsFailure: number | null = null;

  constructor(private readonly validCredentials: Credentials) {}

  setProducts(products: Product[]): this {
    this.products = structuredClone(products);
    return this;
  }

  failProductsWith(status: number): this {
    this.productsFailure = status;
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

  listProducts(authorization: string | undefined): { status: number; body: Product[] | { message: string } } {
    // O token só precisa ter o formato emitido pelo login: assim vale em qualquer teste, não só no que logou.
    if (!authorization?.startsWith(`Bearer ${TOKEN_PREFIX}`)) {
      return { status: 401, body: { message: 'Não autorizado' } };
    }
    if (this.productsFailure !== null) {
      return { status: this.productsFailure, body: { message: 'Erro interno' } };
    }
    return { status: 200, body: structuredClone(this.products) };
  }
}
