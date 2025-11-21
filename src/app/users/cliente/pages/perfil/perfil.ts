import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../services/auth.service';
import { PerfilService } from '../../../../services/perfil.service';
import { PerfilUsuario } from '../../../../models/app.models';

@Component({
  selector: 'app-perfil',
  imports: [Header, Footer, CommonModule, ReactiveFormsModule],
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

  ngOnInit() {
    this.initForm();
    this.cargarDatosUsuario();
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

  cargarDatosUsuario() {
    this.loading.set(true);
    
    const token = localStorage.getItem('token');
    console.log('🔍 Cargando perfil del usuario...');
    console.log('🔑 Token existe?', !!token);
    console.log('🔑 Token (primeros 50 chars):', token?.substring(0, 50));
    console.log('👤 Usuario autenticado?', this.authService.isAuthenticated());
    
    const currentUser = this.authService.currentUser();
    console.log('👤 Usuario actual:', currentUser);
    
    // Verificar expiración del token
    if (currentUser) {
      const now = Math.floor(Date.now() / 1000);
      const exp = currentUser.exp;
      
      if (exp) {
        const timeLeft = exp - now;
        console.log('⏰ Token expira en:', timeLeft, 'segundos (', Math.floor(timeLeft / 60), 'minutos )');
        
        if (timeLeft <= 0) {
          console.error('❌ Token EXPIRADO');
          localStorage.removeItem('token');
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
          return;
        }
      }
    }
    
    // Verificar que el usuario esté autenticado
    if (!this.authService.isAuthenticated() || !token) {
      console.warn('⚠️ No autenticado o sin token, redirigiendo a login');
      alert('Debes iniciar sesión para ver tu perfil.');
      this.router.navigate(['/login']);
      return;
    }
    
    // Obtener datos del perfil desde la API
    this.perfilService.obtenerPerfil().subscribe({
      next: (datosUsuario) => {
        console.log('✅ Datos del perfil recibidos:', datosUsuario);
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
        console.error('❌ Error al cargar perfil:', error);
        console.error('📊 Status:', error.status);
        console.error('📝 Error completo:', error.error);
        console.error('🔗 URL llamada:', error.url);
        
        this.loading.set(false);
        
        // Si es 401, usar datos del token como fallback en lugar de cerrar sesión
        if (error.status === 401) {
          console.warn('⚠️ Error 401: Usando datos del token JWT como fallback');
          console.error('📝 Mensaje del backend:', error.error?.message || error.message);
          
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
            console.log('✅ Perfil cargado desde token JWT:', datosBasicos);
            // NO redirigir al login, permitir que el usuario vea su perfil
            return;
          } else {
            // Solo si no hay token válido, entonces sí redirigir
            localStorage.removeItem('token');
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            this.router.navigate(['/login']);
            return;
          }
        }
        
        // Si es 403, intentar usar datos del token como fallback
        if (error.status === 403) {
          console.warn('⚠️ Backend rechazó la petición (403), usando datos del token JWT');
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
            console.log('✅ Perfil cargado desde token JWT:', datosBasicos);
            return;
          }
        }
        
        // Si es 401, el token realmente es inválido
        if (error.status === 401) {
          console.error('🚫 Token inválido o expirado');
          localStorage.removeItem('token');
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.router.navigate(['/login']);
          return;
        }
        
        // Para otros errores, intentar usar datos del token
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          console.log('ℹ️ Usando datos del token JWT como fallback');
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
          alert('Error al cargar los datos del perfil. Por favor, recarga la página.');
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
    
    console.log('Datos a enviar al backend:', datosActualizados);
    
    // Llamada real al backend
    this.perfilService.actualizarPerfil(datosActualizados).subscribe({
      next: (mensaje) => {
        console.log(mensaje);
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

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
