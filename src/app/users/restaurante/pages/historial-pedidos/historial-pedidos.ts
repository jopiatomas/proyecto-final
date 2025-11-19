import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RestauranteService, Pedido } from '../../../../core/services/restaurante.service';

@Component({
  selector: 'app-historial-pedidos',
  imports: [Header, Footer, CommonModule],
  templateUrl: './historial-pedidos.html',
  styleUrl: './historial-pedidos.css',
})
export class HistorialPedidos implements OnInit {
  pedidos = signal<Pedido[]>([]);
  pedidoSeleccionado = signal<Pedido | null>(null);

  constructor(private restauranteService: RestauranteService) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.restauranteService.getHistorialPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
      }
    });
  }

  verDetalle(pedido: Pedido) {
    this.pedidoSeleccionado.set(pedido);
  }

  cerrarDetalle() {
    this.pedidoSeleccionado.set(null);
  }
}
