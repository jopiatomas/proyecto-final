import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-registro-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro-form.html',
  styleUrl: './registro-form.css',
})
export class RegistroForm {

  registroForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(25)
      ]],
      usuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(18),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      contrasenia: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9._]+$/)
      ]],
      rol: ['CLIENTE', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      // Preparar datos según el rol seleccionado
      const rol = this.registroForm.value.rol;
      const nombreIngresado = this.registroForm.value.nombre;
      
      const registerData: any = {
        usuario: this.registroForm.value.usuario,
        contrasenia: this.registroForm.value.contrasenia,
        rol: rol
      };

      // El backend espera campos diferentes según el rol
      if (rol === 'CLIENTE') {
        registerData.nombreYapellido = nombreIngresado;
      } else if (rol === 'RESTAURANTE') {
        registerData.nombreRestaurante = nombreIngresado;
      }

      console.log('===== DEBUG REGISTRO =====');
      console.log('Rol seleccionado:', rol);
      console.log('JSON que se enviará:', JSON.stringify(registerData));
      console.log('==========================');

      // Llamar al servicio de autenticación
      this.authService.register(registerData).subscribe({
        next: (response: any) => {
          this.loading.set(false);
          this.successMessage.set('¡Registro exitoso! Redirigiendo al login...');
          console.log('Registro exitoso:', response);
          
          // Redirigir al login después de 1.5 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error: any) => {
          this.loading.set(false);
          console.error('Error en registro:', error);
          
          // Manejar diferentes tipos de errores
          if (error.status === 0) {
            this.errorMessage.set('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
          } else if (error.status === 400) {
            // Mostrar mensaje específico del backend si está disponible
            const mensajeBackend = error.error?.error || error.error;
            this.errorMessage.set(mensajeBackend || 'Datos inválidos. Verifica los campos.');
          } else if (error.status === 409) {
            this.errorMessage.set('El usuario ya existe.');
          } else {
            this.errorMessage.set('Error al registrarse. Intenta nuevamente.');
          }
        }
      });
    }
  }
}