import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ClienteService } from '../../../../services/cliente.service';
import { DireccionDTO } from '../../../../models/app.models';

@Component({
  selector: 'app-direcciones',
  imports: [Header, Footer, CommonModule, ReactiveFormsModule],
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

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDirecciones();
  }

  inicializarFormulario() {
    this.formularioDireccion = this.fb.nonNullable.group({
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      ciudad: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      pais: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]+$/)]],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]]
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
    const direccion = this.direcciones().find(d => d.id === id);
    if (!direccion) return;
    
    if (confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.cargando.set(true);
      
      const eliminarDTO = {
        id: direccion.id,
        direccion: direccion.direccion,
        codigoPostal: direccion.codigoPostal
      };
      
      this.clienteService.eliminarDireccion(eliminarDTO).subscribe({
        next: () => {
          this.cargarDirecciones();
          if (this.editandoId() === id) {
            this.cerrarPanel();
          }
        },
        error: (error) => {
          console.error('Error completo al eliminar dirección:', error);
          console.error('Status:', error.status);
          console.error('Mensaje:', error.error);
          this.cargando.set(false);
          
          if (error.status === 401) {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            localStorage.removeItem('token');
            window.location.href = '/login';
          } else {
            alert(`Error al eliminar la dirección: ${error.error?.message || error.message || 'Error desconocido'}`);
          }
        }
      });
    }
  }

  guardarDireccion() {
    if (this.formularioDireccion.valid) {
      this.cargando.set(true);
      const datosDireccion = this.formularioDireccion.value;
      
      if (this.editandoId()) {
        // Limpiar caracteres especiales antes de enviar
        const datosDireccionLimpia = {
          ...datosDireccion,
          pais: datosDireccion.pais.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          ciudad: datosDireccion.ciudad.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
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
            
            alert(`Error al modificar la dirección: ${error.error?.message || error.message || 'Error desconocido'}`);
          }
        });
      } else {
        // Limpiar caracteres especiales antes de enviar
        const datosDireccionLimpia = {
          ...datosDireccion,
          pais: datosDireccion.pais.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), // Quita acentos
          ciudad: datosDireccion.ciudad.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
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
              mensajeError = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
            } else if (error.message) {
              mensajeError = error.message;
            }
            
            alert(`Error al crear la dirección: ${mensajeError}`);
          }
        });
      }
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }
}
