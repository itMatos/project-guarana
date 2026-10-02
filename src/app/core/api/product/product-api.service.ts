import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../shared/models/product.model';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getProducts(): Observable<Product[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.token ?? ''}` });
    return this.http.get<Product[]>(`${environment.apiUrl}/products`, { headers });
  }
}
