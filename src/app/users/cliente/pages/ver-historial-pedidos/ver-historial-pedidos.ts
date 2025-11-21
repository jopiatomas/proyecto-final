import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ClienteService } from '../../../../services/cliente.service';
import { PedidoDetailDTO, PedidoResumenDTO } from '../../../../models/app.models';

@Component({
  selector: 'app-ver-historial-pedidos',
  imports: [CommonModule, Header, Footer, DatePipe],
  templateUrl: './ver-historial-pedidos.html',
  styleUrl: './ver-historial-pedidos.css',
})
export class VerHistorialPedidos implements OnInit {

  private clienteService = inject(ClienteService);

  pedidos: PedidoResumenDTO[] = [];
  pedidoSeleccionado: PedidoDetailDTO | null = null;
  loading = false;
  loadingDetalle = false;
  error: string | null = null;
  mostrarMenuOpciones = false;

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.error = null;
    
    this.clienteService.getPedidosHistorial().subscribe({
      next: (pedidos) => {
        // Ordenar pedidos con más nuevos arriba
        this.pedidos = pedidos.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando historial de pedidos:', error);
        this.error = 'Error cargando el historial de pedidos. Intenta nuevamente.';
        this.loading = false;
      }
    });
  }

  seleccionarPedido(pedidoId: number) {
    this.loadingDetalle = true;
    this.mostrarMenuOpciones = false;
    
    this.clienteService.getPedidoDetalle(pedidoId).subscribe({
      next: (detalle) => {
        this.pedidoSeleccionado = detalle;
        this.loadingDetalle = false;
      },
      error: (error) => {
        console.error('Error cargando detalle del pedido:', error);
        this.loadingDetalle = false;
      }
    });
  }

  toggleMenuOpciones() {
    this.mostrarMenuOpciones = !this.mostrarMenuOpciones;
  }

  cancelarPedido() {
    if (!this.pedidoSeleccionado) return;

    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      this.clienteService.cancelarPedido(this.pedidoSeleccionado.id).subscribe({
        next: () => {
          alert('Pedido cancelado exitosamente');
          this.cargarPedidos(); // Recargar la lista
          this.pedidoSeleccionado = null; // Limpiar selección
          this.mostrarMenuOpciones = false;
        },
        error: (error) => {
          console.error('Error cancelando pedido:', error);
          alert('Error al cancelar el pedido. Intenta nuevamente.');
        }
      });
    }
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return '#ffc107';
      case 'ENVIADO': return '#17a2b8';
      case 'EN_PREPARACION': return '#fd7e14';
      case 'ENTREGADO': return '#28a745';
      case 'CANCELADO': return '#dc3545';
      default: return '#6c757d';
    }
  }

  formatearEstado(estado: string): string {
    switch (estado) {
      case 'EN_PREPARACION': return 'En Preparación';
      default: return estado.charAt(0) + estado.slice(1).toLowerCase();
    }
  }

  puedeSerCancelado(estado: string): boolean {
    // Solo se pueden cancelar pedidos que están pendientes o en preparación
    return estado === 'PENDIENTE' || estado === 'PREPARACION';
  }
}
