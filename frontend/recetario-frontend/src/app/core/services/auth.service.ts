import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenResponse, User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'recetario_access_token';
const REFRESH_TOKEN_KEY = 'recetario_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  // Estado reactivo simple para saber si hay sesión activa
  isAuthenticated = signal<boolean>(this.hasValidSession());

  constructor(private http: HttpClient) {}

  register(email: string, password: string, full_name: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, { email, password, full_name });
  }

  /** Inicio de sesión: correo + contraseña. */
  login(email: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((tokens) => this.storeTokens(tokens))
    );
  }

  refreshToken(): Observable<TokenResponse> {
    const refresh_token = this.getRefreshToken();
    return this.http.post<TokenResponse>(`${this.baseUrl}/refresh`, { refresh_token }).pipe(
      tap((tokens) => this.storeTokens(tokens))
    );
  }

  logout(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private storeTokens(tokens: TokenResponse): void {
    // sessionStorage: el token vive solo mientras la pestaña está abierta,
    // reduciendo el riesgo frente a XSS persistente comparado con localStorage.
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    this.isAuthenticated.set(true);
  }

  private hasValidSession(): boolean {
    return !!sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }
}
