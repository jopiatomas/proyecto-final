import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, Usuario } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  
  // Signals para manejar estado
  currentUser = signal<Usuario | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  
    // Verificar si hay un token válido al iniciar la app
   
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      const user = this.getUserFromToken(token);
      if (user) {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } else {
        this.logout();
      }
    }
  }

 // Login
  login(usuarioLogin: LoginRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, usuarioLogin, { responseType: 'text' })
      .pipe(
        tap(token => {
          this.setToken(token);
          const user = this.getUserFromToken(token);
          if (user) {
            this.currentUser.set(user);
            this.isAuthenticated.set(true);
            this.redirectByRole(user.rol);
          }
        })
      );
  }

 // Registro
  register(data: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/registro`, data, { responseType: 'text' });
  }

  // Logout
  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  // Guardar token en localStorage   
  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Obtener token de localStorage
  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Decodificar JWT y extraer información del usuario
  private getUserFromToken(token: string): Usuario | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload del token JWT:', payload);
      
      // Extraer rol del array roles que viene del backend
      let rol = 'CLIENTE';
      if (payload.roles && payload.roles.length > 0) {
        // Viene como "ROLE_CLIENTE", quitamos el prefijo
        rol = payload.roles[0].replace('ROLE_', '');
      }
      
      return {
        id: payload.userId || 0,
        usuario: payload.sub,
        nombre: payload.nombre || payload.sub,
        rol: rol as 'CLIENTE' | 'RESTAURANTE' | 'ADMIN',
        email: payload.email,
        telefono: payload.telefono
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Redirigir según el rol del usuario
  private redirectByRole(rol: string): void {
    switch (rol) {
      case 'CLIENTE':
        this.router.navigate(['/cliente']);
        break;
      case 'RESTAURANTE':
        this.router.navigate(['/restaurante']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  // Obtener rol del usuario actual
  getUserRole(): string | null {
    return this.currentUser()?.rol || null;
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }
}
