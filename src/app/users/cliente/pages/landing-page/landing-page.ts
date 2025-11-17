import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { RestauranteService } from '../../../../services/restaurante.service';

interface Restaurante {
  id: number;
  nombre: string;
  categoria: string;
  descripcion?: string;
  direccion?: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [Header, Footer, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  private restauranteService = inject(RestauranteService);
  private router = inject(Router);
  
  restaurantes: Restaurante[] = [];
  loading = false;

  ngOnInit() {
    this.cargarRestaurantes();
  }

  cargarRestaurantes() {
    this.loading = true;
    this.restauranteService.getRestaurantes().subscribe({
      next: (restaurantes) => {
        this.restaurantes = restaurantes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        this.loading = false;
        // Datos de prueba si falla la conexión
        this.restaurantes = [
          { id: 1, nombre: 'Pizza Palace', categoria: 'Pizza' },
          { id: 2, nombre: 'Burger King', categoria: 'Hamburguesas' },
          { id: 3, nombre: 'Sushi Zen', categoria: 'Sushi' },
          { id: 4, nombre: 'Taco Bell', categoria: 'Mexicana' },
          { id: 5, nombre: 'Pasta Roma', categoria: 'Italiana' },
          { id: 6, nombre: 'Wok Express', categoria: 'China' }
        ];
      }
    });
  }

  verRestaurante(restaurante: Restaurante) {
    this.router.navigate(['/cliente/restaurante', restaurante.id]);
  }
}
