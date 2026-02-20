import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-login-form',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {

  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          
          if (error.status === 401) {
            this.errorMessage.set('Usuario o contraseña incorrectos');
          } else if (error.status === 0) {
            this.errorMessage.set('No se pudo conectar con el servidor');
          } else {
            this.errorMessage.set('Error al iniciar sesión. Inténtalo de nuevo.');
          }
        }
      });
    }
  }
}
