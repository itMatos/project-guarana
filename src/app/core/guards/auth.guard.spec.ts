import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const state = { url: '/store/products' } as RouterStateSnapshot;
  const run = () =>
    TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, state));

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('redirects to /login when logged out', () => {
    const result = run() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe(
      '/login?error=auth-required&from=%2Fstore%2Fproducts',
    );
  });

  it('allows access when logged in', () => {
    sessionStorage.setItem('guarana-session', JSON.stringify({ token: 't', username: 'u' }));
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(true);
    expect(run()).toBe(true);
  });
});
