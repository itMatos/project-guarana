import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { MOCK_PASSWORD, MOCK_USERNAMES } from '../../../../mocks/data/users';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';

  readonly showCredentials = environment.useMocks;
  readonly mockUsernames = MOCK_USERNAMES;
  readonly mockPassword = MOCK_PASSWORD;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/store/products']);
      return;
    }

    const params = this.route.snapshot.queryParamMap;
    if (params.get('error') === 'auth-required') {
      this.showError(`Você só pode acessar '${params.get('from')}' quando estiver logado.`);
    }
  }

  login(): void {
    this.authService.login({ username: this.username, password: this.password });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 6000 });
  }
}
