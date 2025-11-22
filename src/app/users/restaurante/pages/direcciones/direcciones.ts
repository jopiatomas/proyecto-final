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

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDirecciones();
  }

  inicializarFormulario() {
    this.formularioDireccion = this.fb.nonNullable.group({
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required, Validators.minLength(2)]],
      pais: ['', [Validators.required, Validators.minLength(2)]],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{4,5}$/)]]
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
        console.error('Error al cargar direcciones:', error);
        this.cargando.set(false);
        alert('Error al cargar las direcciones');
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

  editarDireccion(direccion: Direccion) {
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
      
      this.restauranteService.eliminarDireccion(eliminarDTO).subscribe({
        next: () => {
          this.cargarDirecciones();
          if (this.editandoId() === id) {
            this.cerrarPanel();
          }
        },
        error: (error) => {
          console.error('Error al eliminar dirección:', error);
          this.cargando.set(false);
          alert('Error al eliminar la dirección');
        }
      });
    }
  }

  guardarDireccion() {
    if (this.formularioDireccion.valid) {
      this.cargando.set(true);
      const datosDireccion = this.formularioDireccion.value;
      
      console.log('Datos a enviar:', datosDireccion);
      
      if (this.editandoId()) {
        this.restauranteService.modificarDireccion(this.editandoId()!, datosDireccion).subscribe({
          next: () => {
            this.cargarDirecciones();
            this.cerrarPanel();
          },
          error: (error) => {
            console.error('Error completo al modificar dirección:', error);
            console.error('Estado:', error.status);
            console.error('Mensaje:', error.error);
            this.cargando.set(false);
            alert(`Error al modificar la dirección: ${error.error?.message || error.message || 'Error desconocido'}`);
          }
        });
      } else {
        this.restauranteService.crearDireccion(datosDireccion).subscribe({
          next: () => {
            this.cargarDirecciones();
            this.cerrarPanel();
          },
          error: (error) => {
            console.error('Error completo al crear dirección:', error);
            console.error('Estado:', error.status);
            console.error('Mensaje:', error.error);
            this.cargando.set(false);
            alert(`Error al crear la dirección: ${error.error?.message || error.message || 'Error desconocido'}`);
          }
        });
      }
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }
}
