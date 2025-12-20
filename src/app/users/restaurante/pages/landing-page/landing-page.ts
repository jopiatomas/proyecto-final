import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { RestauranteService, Pedido } from '../../../../core/services/restaurante.service';
import { FooterRestaurante } from '../../components/footer/footer';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [Header, CommonModule, FooterRestaurante],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  pedidos = signal<Pedido[]>([]);
  pedidoSeleccionado = signal<Pedido | null>(null);
  estadoNuevo = signal<string | null>(null);
  confirmandoCambioEstado = false;
  cambiandoEstado = false;
  mensajeCambioEstado = '';
  tipoMensajeCambioEstado: 'success' | 'error' = 'success';

  constructor(private restauranteService: RestauranteService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.restauranteService.getPedidosEnCurso().subscribe({
      next: (pedidos: Pedido[]) => {
        this.pedidos.set(pedidos);
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
      },
    });
  }

  verDetalle(pedido: Pedido) {
    this.pedidoSeleccionado.set(pedido);
    this.estadoNuevo.set(null);
  }

  cerrarDetalle() {
    this.pedidoSeleccionado.set(null);
    this.estadoNuevo.set(null);
  }

  seleccionarEstado(estado: string) {
    this.estadoNuevo.set(estado);
  }

  confirmarCambio() {
    // Validar que haya un estado nuevo seleccionado
    if (!this.estadoNuevo()) {
      return;
    }

    // Ejecutar el cambio directamente
    this.ejecutarCambioEstado();
  }

  ejecutarCambioEstado() {
    const pedido = this.pedidoSeleccionado();
    const estado = this.estadoNuevo();

    if (pedido && estado) {
      this.cambiandoEstado = true;
      this.restauranteService.cambiarEstadoPedido(pedido.id, estado).subscribe({
        next: (pedidoActualizado: Pedido) => {
          this.cambiandoEstado = false;
          this.confirmandoCambioEstado = false;
          this.mensajeCambioEstado = 'Estado actualizado exitosamente';
          this.tipoMensajeCambioEstado = 'success';

          if (estado === 'CANCELADO' || estado === 'ENTREGADO') {
            const pedidosActualizados = this.pedidos().filter((p) => p.id !== pedido.id);
            this.pedidos.set(pedidosActualizados);
            this.cerrarDetalle();
          } else {
            // Mantener los detalles originales del pedido
            const pedidosActualizados = this.pedidos().map((p) =>
              p.id === pedido.id ? { ...p, estado: estado } : p
            );
            this.pedidos.set(pedidosActualizados);
            this.pedidoSeleccionado.set({ ...pedido, estado: estado });
            this.estadoNuevo.set(null);
          }

          setTimeout(() => {
            this.mensajeCambioEstado = '';
          }, 5000);
        },
        error: (error: any) => {
          this.cambiandoEstado = false;
          this.confirmandoCambioEstado = false;
          this.mensajeCambioEstado = 'Error al cambiar estado del pedido';
          this.tipoMensajeCambioEstado = 'error';
          console.error('Error al cambiar estado:', error);

          setTimeout(() => {
            this.mensajeCambioEstado = '';
          }, 5000);
        },
      });
    }
  }

  cancelarCambioEstado() {
    this.confirmandoCambioEstado = false;
  }
}
