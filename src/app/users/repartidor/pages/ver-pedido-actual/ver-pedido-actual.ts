import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { RepartidorService } from '../../../../core/services/repartidor.service';

@Component({
  selector: 'app-ver-pedido-actual',
  imports: [Header, FooterRepartidor, CommonModule],
  templateUrl: './ver-pedido-actual.html',
  styleUrl: './ver-pedido-actual.css',
})
export class VerPedidoActual implements OnInit {
  private repartidorService = inject(RepartidorService);
  router = inject(Router);

  pedido = signal<any | null>(null);
  loading = signal(false);
  marcandoEntregado = signal(false);
  mostrarModalConfirmacion = signal(false);
  mostrarModalExito = signal(false);
  modalMensaje = signal('');
  modalTitulo = signal('');

  ngOnInit() {
    this.cargarPedidoActual();
  }

  cargarPedidoActual() {
    this.loading.set(true);

    this.repartidorService.obtenerPedidoActual().subscribe({
      next: (pedido) => {
        this.pedido.set(pedido);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando pedido actual:', error);
        this.pedido.set(null);
        this.loading.set(false);
      },
    });
  }

  marcarComoEntregado() {
    this.modalTitulo.set('Confirmar Entrega');
    this.modalMensaje.set('¿Deseas marcar este pedido como entregado?');
    this.mostrarModalConfirmacion.set(true);
  }

  confirmarEntrega() {
    const pedidoId = this.pedido()?.id;
    if (!pedidoId) return;

    this.marcandoEntregado.set(true);
    this.mostrarModalConfirmacion.set(false);

    this.repartidorService.marcarEntregado(pedidoId).subscribe({
      next: () => {
        this.marcandoEntregado.set(false);
        this.modalTitulo.set('¡Buen Trabajo!');
        this.modalMensaje.set('Pedido marcado como entregado exitosamente. ¡Excelente desempeño!');
        this.mostrarModalExito.set(true);
      },
      error: (error: any) => {
        console.error('Error marcando como entregado:', error);
        this.modalTitulo.set('Error');
        this.modalMensaje.set('No se pudo marcar el pedido como entregado. Intenta de nuevo.');
        this.mostrarModalExito.set(true);
        this.marcandoEntregado.set(false);
      },
    });
  }

  cerrarModalConfirmacion() {
    this.mostrarModalConfirmacion.set(false);
  }

  cerrarModalExito() {
    this.mostrarModalExito.set(false);
    if (this.modalTitulo() === '¡Buen Trabajo!') {
      this.router.navigate(['/repartidor']);
    }
  }

  cambiarEstado(nuevoEstado: string) {
    const pedidoId = this.pedido()?.id;
    if (!pedidoId) return;

    this.marcandoEntregado.set(true);

    // Si el nuevo estado es ENTREGADO, usar marcarEntregado con modal
    if (nuevoEstado === 'ENTREGADO') {
      this.modalTitulo.set('Confirmar Entrega');
      this.modalMensaje.set('¿Estás seguro de que deseas marcar este pedido como entregado?');
      this.mostrarModalConfirmacion.set(true);
      this.marcandoEntregado.set(false);
    } else {
      // Para otros estados, actualizar el estado
      this.repartidorService.cambiarEstadoPedido(pedidoId, nuevoEstado).subscribe({
        next: () => {
          this.marcandoEntregado.set(false);
          console.log('Estado del pedido actualizado a:', nuevoEstado);
          this.cargarPedidoActual();
        },
        error: (error: any) => {
          console.error('Error al cambiar estado:', error);
          this.modalTitulo.set('Error');
          this.modalMensaje.set('No se pudo actualizar el estado del pedido.');
          this.mostrarModalExito.set(true);
          this.marcandoEntregado.set(false);
        },
      });
    }
  }

  volverAlPanel() {
    this.router.navigate(['/repartidor']);
  }
}
