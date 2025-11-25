import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FooterCliente } from '../../components/footer/footer';
import { ClienteService } from '../../../../core/services/cliente.service';
import { DireccionDTO } from '../../../../core/models/app.models';
import { Header } from '../../components/header/header';


@Component({
  selector: 'app-direcciones',
  imports: [Header, FooterCliente, CommonModule, ReactiveFormsModule],
  templateUrl: './direcciones.html',
  styleUrl: './direcciones.css',
})
export class Direcciones implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  
  direcciones = signal<DireccionDTO[]>([]);
  formularioDireccion!: FormGroup;
  panelAbierto = signal(false);
  editandoId = signal<number | null>(null);
  cargando = signal(false);
  confirmandoEliminacion = signal(false);
  idDireccionParaEliminar = signal<number | null>(null);
  mensajeDireccion = '';
  tipoMensajeDireccion: 'success' | 'error' | '' = '';


  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDirecciones();
  }

   inicializarFormulario() {
    this.formularioDireccion = this.fb.nonNullable.group({
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      ciudad: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/),
        ],
      ],
      pais: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/),
        ],
      ],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
    });
  }

  cargarDirecciones() {
    this.cargando.set(true);
    this.clienteService.getDirecciones().subscribe({
      next: (direcciones) => {
        this.direcciones.set(direcciones);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        // Si el error es 400 con mensaje de "no hay direcciones", tratarlo como lista vacía
        if (error.status === 400 && error.error?.message?.toLowerCase().includes('no hay direcciones')) {
          this.direcciones.set([]);
        } else {
          console.error('Error al cargar direcciones:', error);
          if (error.status !== 404 && error.status !== 0) {
            // Solo mostrar alert para errores reales del servidor
            alert('Error al cargar las direcciones');
          }
        }
      }
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

  editarDireccion(direccion: DireccionDTO) {
    this.editandoId.set(direccion.id);
    this.panelAbierto.set(true);
    this.formularioDireccion.patchValue(direccion);
  }

  eliminarDireccion(id: number) {
    this.idDireccionParaEliminar.set(id);
    this.confirmandoEliminacion.set(true);
  }

  confirmarEliminacion() {
    const id = this.idDireccionParaEliminar();
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

    this.clienteService.eliminarDireccion(eliminarDTO).subscribe({
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
        console.error('Error completo al eliminar dirección:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.error);
        this.cargando.set(false);

        if (error.status === 401) {
          this.mensajeDireccion = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          this.tipoMensajeDireccion = 'error';
          setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }, 2000);
        } else {
          this.mensajeDireccion = `Error al eliminar la dirección: ${
            error.error?.message || error.message || 'Error desconocido'
          }`;
          this.tipoMensajeDireccion = 'error';
          setTimeout(() => {
            this.mensajeDireccion = '';
            this.tipoMensajeDireccion = '';
          }, 5000);
        }
      },
    });
  }

  cancelarEliminacion() {
    this.confirmandoEliminacion.set(false);
    this.idDireccionParaEliminar.set(null);
  }

  guardarDireccion() {
    if (this.formularioDireccion.valid) {
      this.cargando.set(true);
      const datosDireccion = this.formularioDireccion.value;

      if (this.editandoId()) {
        // Limpiar caracteres especiales antes de enviar
        const datosDireccionLimpia = {
          ...datosDireccion,
          pais: datosDireccion.pais.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
          ciudad: datosDireccion.ciudad.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        };
        this.clienteService.modificarDireccion(this.editandoId()!, datosDireccionLimpia).subscribe({
          next: () => {
            this.cargarDirecciones();
            this.cerrarPanel();
          },
          error: (error) => {
            console.error('Error al modificar dirección:', error);
            this.cargando.set(false);

            if (error.status === 401) {
              alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              localStorage.removeItem('token');
              window.location.href = '/login';
              return;
            }

            alert(
              `Error al modificar la dirección: ${
                error.error?.message || error.message || 'Error desconocido'
              }`
            );
          },
        });
      } else {
        // Limpiar caracteres especiales antes de enviar
        const datosDireccionLimpia = {
          ...datosDireccion,
          pais: datosDireccion.pais.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), // Quita acentos
          ciudad: datosDireccion.ciudad.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        };
        this.clienteService.crearDireccion(datosDireccionLimpia).subscribe({
          next: (response) => {
            this.cargarDirecciones();
            this.cerrarPanel();
          },
          error: (error) => {
            this.cargando.set(false);

            if (error.status === 401) {
              alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              localStorage.removeItem('token');
              window.location.href = '/login';
              return;
            }

            let mensajeError = 'Error desconocido';
            if (error.error?.message) {
              mensajeError = error.error.message;
            } else if (error.error) {
              mensajeError =
                typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
            } else if (error.message) {
              mensajeError = error.message;
            }

            alert(`Error al crear la dirección: ${mensajeError}`);
          },
        });
      }
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }
}