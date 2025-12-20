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

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      usuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(18),
          Validators.pattern(/^[a-zA-Z0-9]+$/),
        ],
      ],
      contrasenia: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z0-9._]+$/),
        ],
      ],
      rol: ['CLIENTE', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
      horaApertura: [''],
      horaCierre: [''],
    });

    // Actualizar validaciones cuando cambia el rol
    this.registroForm.get('rol')?.valueChanges.subscribe((rol) => {
      const horaAperturaControl = this.registroForm.get('horaApertura');
      const horaCierreControl = this.registroForm.get('horaCierre');

      if (rol === 'RESTAURANTE') {
        horaAperturaControl?.setValidators([
          Validators.required,
          Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ]);
        horaCierreControl?.setValidators([
          Validators.required,
          Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ]);
      } else {
        horaAperturaControl?.clearValidators();
        horaCierreControl?.clearValidators();
      }

      horaAperturaControl?.updateValueAndValidity();
      horaCierreControl?.updateValueAndValidity();
    });
  }

  get isRestaurante(): boolean {
    return this.registroForm.get('rol')?.value === 'RESTAURANTE';
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
        rol: rol,
        email: this.registroForm.value.email,
      };

      // El backend espera campos diferentes según el rol
      if (rol === 'CLIENTE') {
        registerData.nombreYapellido = nombreIngresado;
      } else if (rol === 'RESTAURANTE') {
        registerData.nombreRestaurante = nombreIngresado;
        registerData.horaApertura = this.registroForm.value.horaApertura;
        registerData.horaCierre = this.registroForm.value.horaCierre;
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
            this.errorMessage.set(
              'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.'
            );
          } else if (error.status === 400) {
            // Mostrar mensaje específico del backend si está disponible
            let mensajeBackend = 'Datos inválidos. Verifica los campos.';

            // Extraer el mensaje limpio del backend
            if (error.error?.message) {
              mensajeBackend = error.error.message;
            } else if (typeof error.error === 'string') {
              // Si es un string, intentar parsearlo como JSON
              try {
                const errorObj = JSON.parse(error.error);
                mensajeBackend = errorObj.message || error.error;
              } catch {
                // Si no es JSON, usar el string directamente
                mensajeBackend = error.error;
              }
            } else if (error.error?.error) {
              mensajeBackend = error.error.error;
            }

            this.errorMessage.set(mensajeBackend);
          } else if (error.status === 409) {
            this.errorMessage.set('El usuario ya existe');
          } else {
            this.errorMessage.set('Error al registrarse. Intenta nuevamente.');
          }
        },
      });
    }
  }
}
