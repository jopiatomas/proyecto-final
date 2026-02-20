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
        const pedidoMapeado = {
          ...pedido,
          direccionEntrega: pedido.direccionEntrega || pedido.clienteDireccion || pedido.direccion || 'No especificada',
          restauranteDireccion: pedido.restauranteDireccion || pedido.direccionRestaurante || 'No especificada'
        };
        
        this.pedido.set(pedidoMapeado);
        this.loading.set(false);
      },
      error: (error) => {
        this.pedido.set(null);
        this.loading.set(false);
      },
    });
  }

  marcarComoEntregado() {
    this.modalTitulo.set('Confirmar Entrega del Pedido');
    this.modalMensaje.set('¿Confirmas que el pedido fue entregado exitosamente al cliente?');
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

  volverAlPanel() {
    this.router.navigate(['/repartidor']);
  }
}
