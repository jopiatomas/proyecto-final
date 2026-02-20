import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import { ClienteService } from '../../../../core/services/cliente.service';
import { RestauranteResumen, ReseniaCreate } from '../../../../core/models/app.models';

@Component({
  selector: 'app-realizar-resenia',
  imports: [Header, FooterCliente, CommonModule, ReactiveFormsModule],
  templateUrl: './realizar-resenia.html',
  styleUrl: './realizar-resenia.css',
})
export class RealizarResenia implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private clienteService = inject(ClienteService);

  reseniaForm!: FormGroup;
  restaurantes = signal<RestauranteResumen[]>([]);
  cargando = signal(false);
  calificacionSeleccionada = signal(0);
  estrellaHover = signal(0);

  // Propiedades para modal de alerta
  mostrarModalAlerta = false;
  tituloAlerta = '';
  mensajeAlerta = '';
  tipoAlerta: 'info' | 'warning' | 'error' | 'success' = 'info';

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarRestaurantes();
  }

  inicializarFormulario() {
    this.reseniaForm = this.fb.nonNullable.group({
      restauranteId: ['', [Validators.required]],
      puntuacion: [0, [Validators.required, Validators.min(0.1), Validators.max(5)]],
      resenia: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
  }

  cargarRestaurantes() {
    this.cargando.set(true);
    this.clienteService.getRestaurantes().subscribe({
      next: (restaurantes) => {
        this.restaurantes.set(restaurantes);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mostrarAlerta('Error', 'Error al cargar los restaurantes', 'error');
      },
    });
  }

  seleccionarCalificacion(calificacion: number) {
    this.calificacionSeleccionada.set(calificacion);
    this.reseniaForm.patchValue({ puntuacion: calificacion });
  }

  onMouseEnter(estrella: number) {
    this.estrellaHover.set(estrella);
  }

  onMouseLeave() {
    this.estrellaHover.set(0);
  }

  estaActiva(estrella: number): boolean {
    const hover = this.estrellaHover();
    const seleccionada = this.calificacionSeleccionada();
    return hover >= estrella || (hover === 0 && seleccionada >= estrella);
  }

  enviarResenia() {
    if (this.reseniaForm.valid) {
      const confirmacion = confirm('¿Estás seguro de que deseas enviar esta reseña?');

      if (confirmacion) {
        this.cargando.set(true);
        const reseniaData: ReseniaCreate = {
          restauranteId: Number(this.reseniaForm.value.restauranteId),
          puntuacion: Number(this.reseniaForm.value.puntuacion),
          resenia: this.reseniaForm.value.resenia,
        };

        this.clienteService.crearResenia(reseniaData).subscribe({
          next: (resenia) => {
            this.mostrarAlerta('¡Éxito!', '¡Reseña enviada con éxito!', 'success');
            this.resetFormulario();
            this.cargando.set(false);
          },
          error: (error) => {
            this.cargando.set(false);
            let mensaje = 'Error al enviar la reseña.';
            if (error.error?.resenia) {
              mensaje = error.error.resenia;
            } else if (error.error?.puntuacion) {
              mensaje = error.error.puntuacion;
            } else if (error.error?.message) {
              mensaje = error.error.message;
            } else if (error.status === 400) {
              mensaje =
                'Datos inválidos. Verifica que hayas completado todos los campos correctamente.';
            }
            this.mostrarAlerta('Error', mensaje, 'error');
          },
        });
      }
    } else {
      this.mostrarAlerta(
        'Campos incompletos',
        'Por favor, completa todos los campos: restaurante, calificación y reseña (mínimo 10 caracteres)',
        'warning'
      );
    }
  }

  resetFormulario() {
    this.reseniaForm.reset();
    this.calificacionSeleccionada.set(0);
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  // Métodos para modal de alerta
  mostrarAlerta(
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) {
    this.tituloAlerta = titulo;
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.mostrarModalAlerta = true;
  }

  cerrarModalAlerta() {
    this.mostrarModalAlerta = false;
  }
}
