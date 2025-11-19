import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { ClienteService } from '../../../../services/cliente.service';
import { RestauranteResumen } from '../../../../models/app.models';

@Component({
  selector: 'app-landing-page',
  imports: [Header, Footer, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  
  restaurantes: RestauranteResumen[] = [];
  loading = false;

  ngOnInit() {
    this.cargarRestaurantes();
  }

  cargarRestaurantes() {
    this.loading = true;
    this.clienteService.getRestaurantes().subscribe({
      next: (restaurantes) => {
        this.restaurantes = restaurantes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        this.loading = false;
        // Datos de prueba si falla la conexión
        this.restaurantes = [
          { id: 1, nombre: 'Pizza Palace' },
          { id: 2, nombre: 'Burger King' },
          { id: 3, nombre: 'Sushi Zen' },
          { id: 4, nombre: 'Taco Bell' },
          { id: 5, nombre: 'Pasta Roma' },
          { id: 6, nombre: 'Wok Express' }
        ];
      }
    });
  }

  verRestaurante(restaurante: RestauranteResumen) {
    // Navegamos usando el nombre del restaurante como parámetro
    this.router.navigate(['/cliente/restaurante', encodeURIComponent(restaurante.nombre)]);
  }
}
