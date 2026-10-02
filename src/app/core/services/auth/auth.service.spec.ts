import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('stores the session after a successful login', () => {
    service.login({ username: 'standard_user', password: 'secret_sauce' }).subscribe();
    http.expectOne('/api/login').flush({ token: 'mock-token-standard_user', username: 'standard_user' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.username).toBe('standard_user');
  });

  it('does not store a session when login fails', () => {
    service.login({ username: 'x', password: 'y' }).subscribe({ error: () => undefined });
    http.expectOne('/api/login').flush({ message: 'erro' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isLoggedIn()).toBe(false);
  });

  it('clears the session on logout', () => {
    service.login({ username: 'standard_user', password: 'secret_sauce' }).subscribe();
    http.expectOne('/api/login').flush({ token: 't', username: 'standard_user' });
    service.logout();

    expect(service.isLoggedIn()).toBe(false);
  });
});
