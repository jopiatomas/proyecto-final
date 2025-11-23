import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth-service';
import { PerfilService } from '../../../../core/services/perfil.service';
import { ActualizarPerfilRestauranteRequest, PerfilUsuario } from '../../../../core/models/app.models';
import { RestauranteService } from '../../../../core/services/restaurante.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [Header, FooterRestaurante, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  private restauranteService = inject(RestauranteService);
  
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
  const currentUser = this.authService.currentUser();

  if (currentUser) {
    const now = Math.floor(Date.now() / 1000);
    const exp = currentUser.exp;

    if (exp) {
      const timeLeft = exp - now;

      if (timeLeft <= 0) {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        return;
      }
    }
  }

  if (!this.authService.isAuthenticated() || !token) {
    this.router.navigate(['/login']);
    return;
  }

  this.restauranteService.obtenerPerfil().subscribe({
    next: (datosUsuario) => {
      this.usuario.set(datosUsuario);

      this.perfilForm.patchValue({
        nombre: datosUsuario.nombreYapellido,
        usuario: datosUsuario.usuario,
        email: datosUsuario.email
      });


      this.loading.set(false);
    },
    error: (error) => {
      this.loading.set(false);

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
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    }
  });
}


  alEnviar() {
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
  nombreRestaurante: this.perfilForm.value.nombre,
  email: this.perfilForm.value.email,
  contraseniaActual: this.perfilForm.value.contrasenia
};

  alert('Enviando al backend:\n\n' + JSON.stringify(datosActualizados, null, 2));
    
  this.restauranteService.actualizarPerfil(datosActualizados as ActualizarPerfilRestauranteRequest).subscribe({
    next: (mensaje) => {
      this.loading.set(false);
      alert(mensaje);
      this.cargarDatosUsuario();
    },
    error: (error) => {
      this.loading.set(false);
      
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
