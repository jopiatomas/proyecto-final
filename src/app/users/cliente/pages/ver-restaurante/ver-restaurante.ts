import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ClienteService } from '../../../../services/cliente.service';
import { 
  RestauranteResumen, 
  ProductoResumen, 
  ReseniaResumen, 
  ReseniaCreate 
} from '../../../../models/app.models';

@Component({
  selector: 'app-ver-restaurante',
  imports: [Header, Footer, CommonModule, ReactiveFormsModule],
  templateUrl: './ver-restaurante.html',
  styleUrl: './ver-restaurante.css',
})
export class VerRestaurante implements OnInit {
  private route = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);
  
  restaurante: RestauranteResumen | null = null;
  menu: ProductoResumen[] = [];
  resenias: ReseniaResumen[] = [];
  loading = true;
  loadingMenu = true;
  nombreRestaurante = '';
  
  // Formulario para nueva reseña
  reseniaForm: FormGroup;
  submittingResenia = false;
  mostrarFormularioResenia = false;

  // Array para mostrar estrellas
  estrellas = [1, 2, 3, 4, 5];

  constructor() {
    this.reseniaForm = this.fb.group({
      resenia: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      calificacion: [5, [Validators.required, Validators.min(0.1), Validators.max(5)]]
    });
  }

  ngOnInit() {
    // Obtenemos el nombre del restaurante de la URL
    this.nombreRestaurante = this.route.snapshot.paramMap.get('nombre') || '';
    if (this.nombreRestaurante) {
      this.cargarDatosRestaurante();
    } else {
      this.loading = false;
      console.error('No se proporcionó nombre de restaurante');
    }
  }

  cargarDatosRestaurante() {
    this.clienteService.getRestauranteByNombre(this.nombreRestaurante).subscribe({
      next: (restaurante) => {
        this.restaurante = restaurante;
        // Cargar menú y reseñas desde el backend
        this.menu = (restaurante.menu || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.resenias = restaurante.reseniasRestaurante || [];
        this.loading = false;
        this.loadingMenu = false;
      },
      error: (error) => {
        console.error('Error cargando datos del restaurante:', error);
        this.loading = false;
        this.loadingMenu = false;
      }
    });
  }

  toggleFormularioResenia() {
    this.mostrarFormularioResenia = !this.mostrarFormularioResenia;
    if (!this.mostrarFormularioResenia) {
      this.reseniaForm.reset({
        resenia: '',
        puntuacion: 5
      });
    }
  }

  establecerPuntuacion(calificacion: number) {
    this.reseniaForm.patchValue({ calificacion });
  }

  submitResenia() {
    if (this.reseniaForm.valid && this.restaurante) {
      this.submittingResenia = true;
      
      const reseniaData: ReseniaCreate = {
        restauranteId: this.restaurante.id,
        comentario: this.reseniaForm.value.resenia.trim(),
        calificacion: this.reseniaForm.value.calificacion
      };

      this.clienteService.crearResenia(reseniaData).subscribe({
        next: (nuevaResenia) => {

          
          // Agregar la nueva reseña al principio de la lista
          const reseniaResumen: ReseniaResumen = {
            id: nuevaResenia.id,
            calificacion: nuevaResenia.calificacion,
            comentario: nuevaResenia.comentario,
            fecha: nuevaResenia.fecha,
            nombreCliente: nuevaResenia.nombreCliente
          };
          this.resenias.unshift(reseniaResumen);
          
          // Resetear formulario y ocultar
          this.reseniaForm.reset({
            resenia: '',
            puntuacion: 5
          });
          this.mostrarFormularioResenia = false;
          this.submittingResenia = false;
          
          alert('¡Reseña enviada exitosamente!');
        },
        error: (error) => {
          console.error('Error enviando reseña:', error);
          this.submittingResenia = false;
          alert('Error al enviar la reseña. Por favor, inténtalo de nuevo.');
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.reseniaForm.controls).forEach(key => {
        this.reseniaForm.get(key)?.markAsTouched();
      });
    }
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getEstrellaIcon(puntuacion: number, estrella: number): string {
    return estrella <= puntuacion ? '★' : '☆';
  }

  calcularPromedioPuntuacion(): number {
    if (this.resenias.length === 0) return 0;
    const suma = this.resenias.reduce((acc, resenia) => acc + resenia.calificacion, 0);
    return suma / this.resenias.length;
  }

  formatearPuntuacion(puntuacion: number): string {
    return puntuacion.toFixed(1);
  }
}
