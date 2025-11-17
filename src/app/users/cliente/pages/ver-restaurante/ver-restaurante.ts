import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RestauranteService, Restaurante } from '../../../../services/restaurante.service';

@Component({
  selector: 'app-ver-restaurante',
  imports: [Header, Footer, CommonModule],
  templateUrl: './ver-restaurante.html',
  styleUrl: './ver-restaurante.css',
})
export class VerRestaurante implements OnInit {
  private route = inject(ActivatedRoute);
  private restauranteService = inject(RestauranteService);
  
  restaurante: Restaurante | null = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarRestaurante(+id);
    }
  }

  cargarRestaurante(id: number) {
    this.restauranteService.getRestauranteById(id).subscribe({
      next: (restaurante) => {
        this.restaurante = restaurante;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando restaurante:', error);
        this.loading = false;
        // Datos de prueba si falla
        this.restaurante = {
          id: id,
          nombre: 'Pizza Palace',
          categoria: 'Pizza',
          descripcion: 'Las mejores pizzas artesanales de la ciudad',
          direccion: 'Av. Principal 123',
          telefono: '+54 11 1234-5678',
          calificacion: 4.5
        };
      }
    });
  }
}
