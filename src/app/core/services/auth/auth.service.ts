import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse } from '../../../shared/models/auth.model';
import { AuthApiService } from '../../api/auth/auth-api.service';

const SESSION_KEY = 'guarana-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly authApi: AuthApiService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  get token(): string | null {
    return this.readSession()?.token ?? null;
  }

  get username(): string | null {
    return this.readSession()?.username ?? null;
  }

  isLoggedIn(): boolean {
    return this.token !== null;
  }

  login(request: LoginRequest): void {
    this.authApi.login(request).subscribe({
      next: (session) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        this.router.navigate(['/store/products']);
      },
      error: (error: HttpErrorResponse) =>
        this.snackBar.open(error.error?.message ?? 'Erro inesperado. Tente novamente.', 'Fechar', {
          duration: 6000,
        }),
    });
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
