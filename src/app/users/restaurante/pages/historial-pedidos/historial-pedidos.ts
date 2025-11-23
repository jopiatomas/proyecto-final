import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import { RestauranteService, Pedido } from '../../../../core/services/restaurante.service';

@Component({
  selector: 'app-historial-pedidos',
  imports: [Header, CommonModule, FooterRestaurante],
  templateUrl: './historial-pedidos.html',
  styleUrl: './historial-pedidos.css',
})
export class HistorialPedidos implements OnInit {
  private restauranteService = inject(RestauranteService);
  
  pedidos = signal<Pedido[]>([]);
  pedidoSeleccionado = signal<Pedido | null>(null);

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.restauranteService.getHistorialPedidos().subscribe({
      next: (pedidos: Pedido[]) => {
        this.pedidos.set(pedidos);
      },
      error: (error: any) => {
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
