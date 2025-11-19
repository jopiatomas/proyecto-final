import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RestauranteService, Pedido } from '../../../../core/services/restaurante.service';

@Component({
  selector: 'app-landing-page',
  imports: [Header, Footer, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  pedidos = signal<Pedido[]>([]);
  pedidoSeleccionado = signal<Pedido | null>(null);
  nuevoEstado = signal<string | null>(null);

  constructor(private restauranteService: RestauranteService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.restauranteService.getPedidosEnCurso().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
      }
    });
  }

  verDetalle(pedido: Pedido) {
    this.pedidoSeleccionado.set(pedido);
    this.nuevoEstado.set(null);
  }

  cerrarDetalle() {
    this.pedidoSeleccionado.set(null);
    this.nuevoEstado.set(null);
  }

  seleccionarEstado(estado: string) {
    this.nuevoEstado.set(estado);
  }

  confirmarCambio() {
    const pedido = this.pedidoSeleccionado();
    const estado = this.nuevoEstado();
    
    if (pedido && estado) {
      this.restauranteService.cambiarEstadoPedido(pedido.id, estado).subscribe({
        next: (pedidoActualizado) => {
          // Si el pedido cambió a CANCELADO o ENTREGADO, lo removemos de la lista
          if (estado === 'CANCELADO' || estado === 'ENTREGADO') {
            const pedidosActualizados = this.pedidos().filter(p => p.id !== pedido.id);
            this.pedidos.set(pedidosActualizados);
            this.cerrarDetalle();
          } else {
            // Si sigue en curso, actualizamos su estado
            const pedidosActualizados = this.pedidos().map(p => 
              p.id === pedido.id ? pedidoActualizado : p
            );
            this.pedidos.set(pedidosActualizados);
            this.pedidoSeleccionado.set(pedidoActualizado);
            this.nuevoEstado.set(null);
          }
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
        }
      });
    }
  }
}
