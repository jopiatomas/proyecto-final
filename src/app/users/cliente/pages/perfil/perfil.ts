import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth-service';
import { PerfilService } from '../../../../core/services/perfil.service';
import { PerfilUsuario } from '../../../../core/models/app.models';


@Component({
  selector: 'app-perfil',
  imports: [Header, FooterCliente, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private perfilService = inject(PerfilService);
  
  perfilForm!: FormGroup;
  usuario = signal<PerfilUsuario | null>(null);
  loading = signal(false);
  mensajePerfil = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  confirmandoActualizacion = false;

  cambiarContraseniaForm!: FormGroup;
mostrarModalContrasenia = false;
cambiandoContrasenia = false;

  ngOnInit() {
    this.initForm();
    this.cargarDatosUsuario();
    this.initCambiarContraseniaForm();
  }

  initForm() {
    this.perfilForm = this.fb.nonNullable.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50)
      ]],
      usuario: [{value: '', disabled: true}, [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(18),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      contrasenia: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  initCambiarContraseniaForm() {
    this.cambiarContraseniaForm = this.fb.group({
      contraseniaActual: ['', [Validators.required, Validators.minLength(6)]],
      contraseniaNueva: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasenia: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  cargarDatosUsuario() {
    this.loading.set(true);
    
    const token = localStorage.getItem('token');
    const currentUser = this.authService.currentUser();
    
    // Verificar expiración del token
    if (currentUser) {
      const now = Math.floor(Date.now() / 1000);
      const exp = currentUser.exp;
      
      if (exp) {
        const timeLeft = exp - now;
        
        if (timeLeft <= 0) {
          localStorage.removeItem('token');
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
          return;
        }
      }
    }
    
    // Verificar que el usuario esté autenticado
    if (!this.authService.isAuthenticated() || !token) {
      alert('Debes iniciar sesión para ver tu perfil.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Obtener datos del perfil desde la API
    this.perfilService.obtenerPerfil().subscribe({
      next: (datosUsuario) => {
        this.usuario.set(datosUsuario);
        // Mapear nombreYapellido a nombre para el formulario
        this.perfilForm.patchValue({
          nombre: datosUsuario.nombreYapellido,
          usuario: datosUsuario.usuario,
          email: datosUsuario.email
        });
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Error al cargar perfil:', error);
        
        // Intentar usar datos del token como fallback
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const datosBasicos: PerfilUsuario = {
            id: currentUser.id,
            nombreYapellido: currentUser.nombre,
            usuario: currentUser.usuario,
            email: currentUser.email
          };
          this.usuario.set(datosBasicos);
          this.perfilForm.patchValue({
            nombre: datosBasicos.nombreYapellido,
            usuario: datosBasicos.usuario,
            email: datosBasicos.email
          });
        } else {
          // Si no hay token válido, redirigir al login
          localStorage.removeItem('token');
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onSubmit() {
    if (this.perfilForm.valid) {
      const confirmacion = confirm('¿Estás seguro de que deseas actualizar tu perfil?');
      
      if (confirmacion) {
        this.actualizarPerfil();
      }
    } else {
      alert('Por favor, completa todos los campos correctamente. La contraseña es requerida para confirmar los cambios.');
    }
  }

  actualizarPerfil() {
    this.loading.set(true);
    const datosActualizados = {
      nombreYapellido: this.perfilForm.value.nombre,
      email: this.perfilForm.value.email,
      contraseniaActual: this.perfilForm.value.contrasenia
    };
    

    
    // Llamada real al backend
    this.perfilService.actualizarPerfil(datosActualizados).subscribe({
      next: (mensaje) => {

        this.loading.set(false);
        alert(mensaje); 
        // Recargar los datos del perfil después de actualizar
        this.cargarDatosUsuario();
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.loading.set(false);
        
        // Mostrar error más específico
        let mensaje = 'Error al actualizar el perfil.';
        if (error.error && error.error.message) {
          mensaje = error.error.message;
        } else if (error.status === 400) {
          mensaje = 'Datos inválidos. Verifica que todos los campos estén correctos.';
        } else if (error.status === 403) {
          mensaje = 'No tienes permisos para actualizar este perfil.';
        }
        
        alert(mensaje + ' Inténtalo de nuevo.');
      }
    });
  }

  cancelarActualizacion() {
    this.confirmandoActualizacion = false;
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  abrirModalContrasenia() {
    this.mostrarModalContrasenia = true;
    this.cambiarContraseniaForm.reset();
  }

  cerrarModalContrasenia() {
    this.mostrarModalContrasenia = false;
    this.cambiarContraseniaForm.reset();
  }

  cambiarContrasenia() {
    if (this.cambiarContraseniaForm.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const { contraseniaActual, contraseniaNueva, confirmarContrasenia } = this.cambiarContraseniaForm.value;

    if (contraseniaNueva !== confirmarContrasenia) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (contraseniaActual === contraseniaNueva) {
      alert('La nueva contraseña debe ser diferente a la actual.');
      return;
    }

    this.cambiandoContrasenia = true;
    this.perfilService.cambiarContrasenia({
      contraseniaActual,
      contraseniaNueva,
      confirmarContrasenia
    }).subscribe({
      next: (mensaje: string) => {
        this.cambiandoContrasenia = false;
        alert(mensaje || '¡Contraseña cambiada exitosamente!');
        this.cerrarModalContrasenia();
      },
      error: (error: any) => {
        this.cambiandoContrasenia = false;
        console.error('Error al cambiar contraseña:', error);
        let mensaje = 'Error al cambiar la contraseña.';
        if (error.error && error.error.message) {
          mensaje = error.error.message;
        } else if (error.status === 400) {
          mensaje = 'La contraseña actual es incorrecta.';
        } else if (error.status === 403) {
          mensaje = 'No tienes permisos para realizar esta acción.';
        }
        alert(mensaje);
      }
    });
  }
}
