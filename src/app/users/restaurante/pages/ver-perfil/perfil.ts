import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-perfil',
  imports: [Header, FooterRestaurante, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);

  formularioPerfil!: FormGroup;
  cargando = signal(false);
  mensajePerfil = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  confirmandoActualizacion = false;

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatosUsuario();
  }

  inicializarFormulario() {
    this.formularioPerfil = this.fb.nonNullable.group({
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
      contrasenia: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  cargarDatosUsuario() {
    this.cargando.set(true);

    const usuarioActual = this.authService.currentUser();
    if (usuarioActual) {
      this.formularioPerfil.patchValue({
        nombre: usuarioActual.nombre,
        usuario: usuarioActual.usuario,
        email: usuarioActual.email,
      });
    }
    this.cargando.set(false);
  }

  alEnviar() {
    if (this.formularioPerfil.valid) {
      this.confirmandoActualizacion = true;
    } else {
      this.mensajePerfil =
        'Por favor, completa todos los campos correctamente. La contraseña es requerida.';
      this.tipoMensaje = 'error';
      setTimeout(() => {
        this.mensajePerfil = '';
        this.tipoMensaje = '';
      }, 5000);
    }
  }

  actualizarPerfil() {
    this.cargando.set(true);
    this.confirmandoActualizacion = false;
    const datosActualizados = {
      nombre: this.formularioPerfil.value.nombre,
      email: this.formularioPerfil.value.email,
      contraseniaActual: this.formularioPerfil.value.contrasenia,
    };

    setTimeout(() => {
      this.cargando.set(false);
      this.mensajePerfil = 'Perfil actualizado exitosamente';
      this.tipoMensaje = 'success';
      this.cargarDatosUsuario();
      setTimeout(() => {
        this.mensajePerfil = '';
        this.tipoMensaje = '';
      }, 5000);
    }, 1000);
  }

  cancelarActualizacion() {
    this.confirmandoActualizacion = false;
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
