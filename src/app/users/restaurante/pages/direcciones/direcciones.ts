import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import { RestauranteService } from '../../../../core/services/restaurante.service';

interface Direccion {
  id: number;
  direccion: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
}

@Component({
  selector: 'app-direcciones',
  imports: [Header, FooterRestaurante, CommonModule, ReactiveFormsModule],
  templateUrl: './direcciones.html',
  styleUrl: './direcciones.css',
})
export class Direcciones implements OnInit {
  private fb = inject(FormBuilder);
  private restauranteService = inject(RestauranteService);

  direcciones = signal<Direccion[]>([]);
  formularioDireccion!: FormGroup;
  panelAbierto = signal(false);
  editandoId = signal<number | null>(null);
  cargando = signal(false);
  mensajeDireccion = '';
  tipoMensajeDireccion: 'success' | 'error' | '' = '';
  confirmandoEliminacion = signal(false);
  idParaEliminar = signal<number | null>(null);

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDirecciones();
  }

  inicializarFormulario() {
    this.formularioDireccion = this.fb.nonNullable.group({
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/),
        ],
      ],
      pais: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/),
        ],
      ],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
    });
  }

  cargarDirecciones() {
    this.cargando.set(true);
    this.restauranteService.getDirecciones().subscribe({
      next: (direcciones) => {
        this.direcciones.set(direcciones);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeDireccion = 'Error al cargar las direcciones';
        this.tipoMensajeDireccion = 'error';
        setTimeout(() => {
          this.mensajeDireccion = '';
          this.tipoMensajeDireccion = '';
        }, 5000);
      },
    });
  }

  abrirPanel() {
    this.panelAbierto.set(true);
    this.editandoId.set(null);
    this.formularioDireccion.reset();
  }

  cerrarPanel() {
    this.panelAbierto.set(false);
    this.editandoId.set(null);
    this.formularioDireccion.reset();
  }

  editarDireccion(direccion: Direccion) {
    this.editandoId.set(direccion.id);
    this.panelAbierto.set(true);
    this.formularioDireccion.patchValue(direccion);
  }

  eliminarDireccion(id: number) {
    this.idParaEliminar.set(id);
    this.confirmandoEliminacion.set(true);
  }

  confirmarEliminacion() {
    const id = this.idParaEliminar();
    if (!id) return;

    const direccion = this.direcciones().find((d) => d.id === id);
    if (!direccion) return;

    this.cargando.set(true);
    this.confirmandoEliminacion.set(false);
    const eliminarDTO = {
      id: direccion.id,
      direccion: direccion.direccion,
      codigoPostal: direccion.codigoPostal,
    };

    this.restauranteService.eliminarDireccion(eliminarDTO).subscribe({
      next: () => {
        this.cargarDirecciones();
        if (this.editandoId() === id) {
          this.cerrarPanel();
        }
        this.mensajeDireccion = 'Dirección eliminada exitosamente';
        this.tipoMensajeDireccion = 'success';
        setTimeout(() => {
          this.mensajeDireccion = '';
          this.tipoMensajeDireccion = '';
        }, 5000);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeDireccion = 'Error al eliminar la dirección';
        this.tipoMensajeDireccion = 'error';
        setTimeout(() => {
          this.mensajeDireccion = '';
          this.tipoMensajeDireccion = '';
        }, 5000);
      },
    });
  }

  cancelarEliminacion() {
    this.confirmandoEliminacion.set(false);
    this.idParaEliminar.set(null);
  }

  guardarDireccion() {
    if (this.formularioDireccion.valid) {
      this.cargando.set(true);
      const datosDireccion = this.formularioDireccion.value;

      if (this.editandoId()) {
        this.restauranteService.modificarDireccion(this.editandoId()!, datosDireccion).subscribe({
          next: () => {
            this.cargarDirecciones();
            this.cerrarPanel();
          },
          error: (error) => {
            this.cargando.set(false);
            this.mensajeDireccion = `Error al modificar la dirección: ${
              error.error?.message || error.message || 'Error desconocido'
            }`;
            this.tipoMensajeDireccion = 'error';
            setTimeout(() => {
              this.mensajeDireccion = '';
              this.tipoMensajeDireccion = '';
            }, 5000);
          },
        });
      } else {
        this.restauranteService.crearDireccion(datosDireccion).subscribe({
          next: () => {
            this.cargarDirecciones();
            this.cerrarPanel();
          },
          error: (error) => {
            this.cargando.set(false);
            this.mensajeDireccion = `Error al crear la dirección: ${
              error.error?.message || error.message || 'Error desconocido'
            }`;
            this.tipoMensajeDireccion = 'error';
            setTimeout(() => {
              this.mensajeDireccion = '';
              this.tipoMensajeDireccion = '';
            }, 5000);
          },
        });
      }
    } else {
      this.mensajeDireccion = 'Por favor completa todos los campos correctamente';
      this.tipoMensajeDireccion = 'error';
      setTimeout(() => {
        this.mensajeDireccion = '';
        this.tipoMensajeDireccion = '';
      }, 5000);
    }
  }
}
