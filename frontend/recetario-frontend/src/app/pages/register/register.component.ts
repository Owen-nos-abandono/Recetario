import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    CardModule,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  email = '';
  password = '';
  fullName = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    // Crea la cuenta y entra directo (sin código de verificación)
    this.authService
      .register(this.email, this.password, this.fullName)
      .pipe(switchMap(() => this.authService.login(this.email, this.password)))
      .subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo completar el registro');
      },
    });
  }
}
