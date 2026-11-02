import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddCartItemRequest, Cart, UpdateCartItemRequest } from '../../../shared/models/cart.model';
import { AuthService } from '../../services/auth/auth.service';

/** Toda operação devolve o carrinho inteiro: é ele o último estado confirmado pela API. */
@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly endpoints = environment.apiEndpoints.cart;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService
  ) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.endpoints.cart, { headers: this.headers() });
  }

  addItem(productId: number): Observable<Cart> {
    const body: AddCartItemRequest = { productId };
    return this.http.post<Cart>(this.endpoints.items, body, { headers: this.headers() });
  }

  updateItem(productId: number, quantity: number): Observable<Cart> {
    const body: UpdateCartItemRequest = { quantity };
    return this.http.put<Cart>(`${this.endpoints.items}/${productId}`, body, { headers: this.headers() });
  }

  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.endpoints.items}/${productId}`, { headers: this.headers() });
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token ?? ''}` });
  }
}
