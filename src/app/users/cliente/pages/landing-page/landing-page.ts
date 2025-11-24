import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterCliente } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { ClienteService } from '../../../../core/services/cliente.service';
import { RestauranteResumen, RestauranteResumidoDTO } from '../../../../core/models/app.models';

@Component({
  selector: 'app-landing-page',
  imports: [Header, FooterCliente, CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  restaurantes: RestauranteResumen[] = [];
  restaurantesFavoritos: RestauranteResumidoDTO[] = [];
  restaurantesFiltrados: RestauranteResumen[] = [];
  loading = false;
  terminoBusqueda = '';
  filtroFavoritosActivo = false;

  ngOnInit() {
    this.cargarRestaurantes();
    this.cargarFavoritos();
  }

  aplicarFiltros() {
    let resultado = this.restaurantes;

    // Filtro por favoritos
    if (this.filtroFavoritosActivo) {
      if (this.restaurantesFavoritos.length > 0) {
        const idsFavoritos = this.restaurantesFavoritos.map(f => f.id);
        resultado = resultado.filter(r => idsFavoritos.includes(r.id));
      } else {
        resultado = [];
      }
    }

    // Filtro por búsqueda
    if (this.terminoBusqueda.trim()) {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      resultado = resultado.filter(restaurante =>
        restaurante.nombre.toLowerCase().includes(termino)
      );
    }

    this.restaurantesFiltrados = resultado;
  }

  cargarRestaurantes() {
    this.loading = true;
    this.clienteService.getRestaurantes().subscribe({
      next: (restaurantes) => {
        this.restaurantes = restaurantes;
        this.loading = false;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        this.loading = false;
      }
    });
  }

  cargarFavoritos() {
    this.clienteService.getRestaurantesFavoritos().subscribe({
      next: (favoritos) => {
        this.restaurantesFavoritos = favoritos;
        this.aplicarFiltros();
      },
      error: () => {
        // Error 400 = sin favoritos, simplemente dejamos el array vacío
        this.restaurantesFavoritos = [];
        this.aplicarFiltros();
      }
    });
  }

  toggleFiltroFavoritos() {
    this.filtroFavoritosActivo = !this.filtroFavoritosActivo;
    this.aplicarFiltros();
  }

  verRestaurante(restaurante: RestauranteResumen) {
    // Navegamos usando el usuario del restaurante como parámetro
    this.router.navigate(['/cliente/restaurante', encodeURIComponent(restaurante.usuario)]);
  }
}