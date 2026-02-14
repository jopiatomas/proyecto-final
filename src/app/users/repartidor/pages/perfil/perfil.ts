import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth-service';
import { RepartidorService, RepartidorDetailDTO } from '../../../../core/services/repartidor.service';

@Component({
  selector: 'app-perfil',
  imports: [Header, FooterRepartidor, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  private repartidorService = inject(RepartidorService);

  perfilForm!: FormGroup;
  usuario = signal<RepartidorDetailDTO | null>(null);
  loading = signal(false);
  mensajePerfil = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  ngOnInit() {
    this.initForm();
    this.cargarDatosUsuario();
  }

  initForm() {
    this.perfilForm = this.fb.nonNullable.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      usuario: [
        { value: '', disabled: true },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(18),
          Validators.pattern(/^[a-zA-Z0-9]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      tipoVehiculo: ['', Validators.required],
      pais: ['', Validators.required],
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  cargarDatosUsuario() {
    this.loading.set(true);
    const token = localStorage.getItem('token');

    if (!this.authService.isAuthenticated() || !token) {
      this.router.navigate(['/login']);
      return;
    }

    this.repartidorService.obtenerPerfil().subscribe({
      next: (datosUsuario: RepartidorDetailDTO) => {
        this.usuario.set(datosUsuario);

        this.perfilForm.patchValue({
          nombre: datosUsuario.nombreYapellido,
          usuario: datosUsuario.usuario,
          email: datosUsuario.email,
          tipoVehiculo: datosUsuario.tipoVehiculo,
          pais: datosUsuario.pais,
        });
        this.loading.set(false);
      },
      error: (error: any) => {
        this.loading.set(false);

        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const datosBasicos: RepartidorDetailDTO = {
            id: currentUser.id,
            nombreYapellido: currentUser.nombre,
            usuario: currentUser.usuario,
            email: currentUser.email,
            pais: '',
            tipoVehiculo: '',
            disponible: false,
            trabajando: false,
            zonas: [],
            totalPedidosEntregados: 0,
            calificacionPromedio: 0,
            activo: true,
          };

          this.usuario.set(datosBasicos);
          this.perfilForm.patchValue({
            nombre: datosBasicos.nombreYapellido,
            usuario: datosBasicos.usuario,
            email: datosBasicos.email,
          });
        }

        this.mostrarMensaje('Error al cargar el perfil', 'error');
      }
    });
  }

  alEnviar() {
    if (this.perfilForm.invalid) {
      this.mostrarMensaje('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    this.loading.set(true);

    const datosActualizados = {
      nombreYapellido: this.perfilForm.get('nombre')?.value,
      email: this.perfilForm.get('email')?.value,
      contraseniaActual: this.perfilForm.get('contrasenia')?.value,
      pais: this.perfilForm.get('pais')?.value,
    };

    this.repartidorService.actualizarPerfil(datosActualizados).subscribe({
      next: () => {
        this.loading.set(false);
        this.mostrarMensaje('Perfil actualizado con éxito', 'success');
        this.cargarDatosUsuario();
      },
      error: (error: any) => {
        this.loading.set(false);
        const mensaje = error.error?.message || 'Error al actualizar el perfil';
        this.mostrarMensaje(mensaje, 'error');
      }
    });
  }

  cambiarContrasenia() {
    const nuevaContrasenia = prompt('Ingresa tu nueva contraseña:');
    if (!nuevaContrasenia) return;

    if (nuevaContrasenia.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    const contraseniaActual = this.perfilForm.get('contrasenia')?.value;

    const datosContrasenia = {
      contraseniaActual: contraseniaActual,
      contraseñaNueva: nuevaContrasenia,
    };

    this.repartidorService.cambiarContrasenia(datosContrasenia).subscribe({
      next: () => {
        this.mostrarMensaje('Contraseña cambiada con éxito', 'success');
      },
      error: (error: any) => {
        const mensaje = error.error?.message || 'Error al cambiar la contraseña';
        this.mostrarMensaje(mensaje, 'error');
      }
    });
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    this.mensajePerfil = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensajePerfil = '';
      this.tipoMensaje = '';
    }, 5000);
  }
}
