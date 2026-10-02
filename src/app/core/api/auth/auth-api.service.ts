import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly authEndpoint = environment.apiEndpoints.auth;

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    // TODO ajustar camada de environment
    // TODO atualizar importacao de environments
    return this.http.post<LoginResponse>(this.authEndpoint.login, request);
  }
}
