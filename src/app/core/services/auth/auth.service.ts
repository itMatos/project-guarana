import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../../shared/models/auth.model';
import { AuthApiService } from '../../api/auth/auth-api.service';

const SESSION_KEY = 'guarana-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly authApi: AuthApiService) {}

  get token(): string | null {
    return this.readSession()?.token ?? null;
  }

  get username(): string | null {
    return this.readSession()?.username ?? null;
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.authApi.login(request).pipe(tap((session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))));
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }

  private readSession(): LoginResponse | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }
}
