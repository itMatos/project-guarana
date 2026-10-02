import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;
  let openSnackBar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    openSnackBar = vi.spyOn(TestBed.inject(MatSnackBar), 'open').mockReturnValue(undefined as never);
  });

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('stores the session and navigates to the store after a successful login', () => {
    service.login({ username: 'standard_user', password: 'secret_sauce' });
    http.expectOne(environment.apiEndpoints.auth.login).flush({ token: 'mock-token-standard_user', username: 'standard_user' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.username).toBe('standard_user');
    expect(navigate).toHaveBeenCalledWith(['/store/products']);
  });

  it('shows the server message and stays logged out when login fails', () => {
    service.login({ username: 'x', password: 'y' });
    http.expectOne(environment.apiEndpoints.auth.login).flush({ message: 'erro' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isLoggedIn()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(openSnackBar).toHaveBeenCalledWith('erro', 'Fechar', { duration: 6000 });
  });

  it('clears the session on logout', () => {
    service.login({ username: 'standard_user', password: 'secret_sauce' });
    http.expectOne(environment.apiEndpoints.auth.login).flush({ token: 't', username: 'standard_user' });
    service.logout();

    expect(service.isLoggedIn()).toBe(false);
  });
});
