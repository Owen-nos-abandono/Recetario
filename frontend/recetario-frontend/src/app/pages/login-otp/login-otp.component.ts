import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-login-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputTextModule, ButtonModule, MessageModule, CardModule],
  templateUrl: './login-otp.component.html',
})
export class LoginOtpComponent implements OnInit {
  email = '';
  code = '';
  loading = false;
  resending = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    if (!this.email) {
      // Si alguien llega directo a esta pantalla sin pasar por login, lo regresamos
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.loginStep2(this.email, this.code).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = extractErrorMessage(err, 'Código inválido o expirado');
      },
    });
  }

  resendCode(): void {
    this.resending = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendCode(this.email, 'login_2fa').subscribe({
      next: () => {
        this.resending = false;
        this.successMessage = 'Se envió un nuevo código a tu correo';
      },
      error: (err) => {
        this.resending = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo reenviar el código');
      },
    });
  }
}
