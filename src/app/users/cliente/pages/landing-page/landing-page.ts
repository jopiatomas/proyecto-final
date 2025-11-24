import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FooterCliente } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { ClienteService } from '../../../../core/services/cliente.service';
import { RestauranteResumen } from '../../../../core/models/app.models';
import { isRestauranteAbierto, formatearHorario } from '../../../../core/utils/horario.utils';

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
  loading = false;
  terminoBusqueda = '';

  ngOnInit() {
    this.cargarRestaurantes();
  }

  get restaurantesFiltrados(): RestauranteResumen[] {
    if (!this.terminoBusqueda.trim()) {
      return this.restaurantes;
    }

    const termino = this.terminoBusqueda.toLowerCase().trim();
    return this.restaurantes.filter(restaurante =>
      restaurante.nombre.toLowerCase().includes(termino)
    );
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
      }
    });
  }

  verRestaurante(restaurante: RestauranteResumen) {
    // Verificar si el restaurante está abierto
    if (!this.isRestauranteAbierto(restaurante)) {
      alert('Este restaurante está cerrado en este momento.');
      return;
    }

    // Navegamos usando el usuario del restaurante como parámetro
    this.router.navigate(['/cliente/restaurante', encodeURIComponent(restaurante.usuario)]);
  }

  isRestauranteAbierto(restaurante: RestauranteResumen): boolean {
    return isRestauranteAbierto(restaurante.horaApertura, restaurante.horaCierre);
  }

  formatearHorario(horario?: string): string {
    return formatearHorario(horario);
  }
}
