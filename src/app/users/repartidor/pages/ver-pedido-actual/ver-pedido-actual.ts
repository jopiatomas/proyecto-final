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
    const pedidoId = this.pedido()?.id;
    if (!pedidoId) return;

    const confirmacion = confirm('¿Deseas marcar este pedido como entregado?');
    if (!confirmacion) return;

    this.marcandoEntregado.set(true);

    this.repartidorService.marcarEntregado(pedidoId).subscribe({
      next: () => {
        this.marcandoEntregado.set(false);
        alert('Pedido marcado como entregado. ¡Excelente trabajo!');
        this.router.navigate(['/repartidor']);
      },
      error: (error: any) => {
        console.error('Error marcando como entregado:', error);
        alert('Error al marcar el pedido como entregado.');
        this.marcandoEntregado.set(false);
      },
    });
  }

  cambiarEstado(nuevoEstado: string) {
    const pedidoId = this.pedido()?.id;
    if (!pedidoId) return;

    this.marcandoEntregado.set(true);

    // Si el nuevo estado es ENTREGADO, usar marcarEntregado
    if (nuevoEstado === 'ENTREGADO') {
      this.repartidorService.marcarEntregado(pedidoId).subscribe({
        next: () => {
          this.marcandoEntregado.set(false);
          alert('Pedido entregado. ¡Excelente trabajo!');
          this.cargarPedidoActual();
        },
        error: (error: any) => {
          console.error('Error al cambiar estado:', error);
          alert('Error al cambiar el estado del pedido.');
          this.marcandoEntregado.set(false);
        },
      });
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
          alert('Error al cambiar el estado del pedido.');
          this.marcandoEntregado.set(false);
        },
      });
    }
  }

  volverAlPanel() {
    this.router.navigate(['/repartidor']);
  }
}
