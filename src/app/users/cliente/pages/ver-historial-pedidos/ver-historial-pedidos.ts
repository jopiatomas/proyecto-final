import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import { ClienteService } from '../../../../core/services/cliente.service';
import { PedidoDetailDTO } from '../../../../core/models/app.models';

@Component({
  selector: 'app-ver-historial-pedidos',
  imports: [CommonModule, Header, FooterCliente, DatePipe],
  templateUrl: './ver-historial-pedidos.html',
  styleUrl: './ver-historial-pedidos.css',
})
export class VerHistorialPedidos implements OnInit {
  private clienteService = inject(ClienteService);

  pedidos: PedidoDetailDTO[] = [];
  pedidosFiltrados: PedidoDetailDTO[] = [];
  pedidoSeleccionado: PedidoDetailDTO | null = null;
  loading = false;
  error: string | null = null;
  mostrarMenuOpciones = false;
  filtroActivo: string = 'TODOS';
  confirmandoCancelacion = false;
  cancelando = false;
  mensajeCancelacion = '';
  tipoMensajeCancelacion: 'success' | 'error' = 'success';

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.error = null;

    this.clienteService.getPedidosHistorial().subscribe({
      next: (pedidos) => {
        // Ordenar pedidos con más nuevos arriba
        this.pedidos = pedidos.sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando historial de pedidos:', error);
        this.error = 'Error cargando el historial de pedidos. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  seleccionarPedido(pedidoId: number) {
    this.mostrarMenuOpciones = false;
    this.pedidoSeleccionado = this.pedidos.find((p) => p.id === pedidoId) || null;
  }

  toggleMenuOpciones() {
    this.mostrarMenuOpciones = !this.mostrarMenuOpciones;
  }

  cancelarPedido() {
    if (!this.pedidoSeleccionado) return;
    this.mostrarMenuOpciones = false;
    this.confirmandoCancelacion = true;
  }

  ejecutarCancelacion() {
    if (!this.pedidoSeleccionado) return;

    this.cancelando = true;
    this.clienteService.cancelarPedido(this.pedidoSeleccionado.id).subscribe({
      next: (mensaje) => {
        this.cancelando = false;
        this.confirmandoCancelacion = false;
        this.mensajeCancelacion = mensaje || 'Pedido cancelado exitosamente';
        this.tipoMensajeCancelacion = 'success';

        this.cargarPedidos();
        this.pedidoSeleccionado = null;

        setTimeout(() => {
          this.mensajeCancelacion = '';
        }, 5000);
      },
      error: (error) => {
        this.cancelando = false;
        this.confirmandoCancelacion = false;
        console.error('Error cancelando pedido:', error);

        const mensajeError = error.error || 'Error al cancelar el pedido';
        this.mensajeCancelacion = mensajeError;
        this.tipoMensajeCancelacion = 'error';

        this.cargarPedidos();
        this.pedidoSeleccionado = null;

        setTimeout(() => {
          this.mensajeCancelacion = '';
        }, 5000);
      },
    });
  }

  cancelarConfirmacion() {
    this.confirmandoCancelacion = false;
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return '#ffc107';
      case 'ENVIADO':
        return '#17a2b8';
      case 'EN_PREPARACION':
        return '#fd7e14';
      case 'ENTREGADO':
        return '#28a745';
      case 'CANCELADO':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  formatearEstado(estado: string): string {
    switch (estado) {
      case 'EN_PREPARACION':
        return 'En Preparación';
      default:
        return estado.charAt(0) + estado.slice(1).toLowerCase();
    }
  }

  puedeSerCancelado(estado: string): boolean {
    // Solo se pueden cancelar pedidos que están pendientes o en preparación
    return estado === 'PENDIENTE';
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (this.filtroActivo === 'TODOS') {
      this.pedidosFiltrados = [...this.pedidos];
    } else {
      this.pedidosFiltrados = this.pedidos.filter((p) => p.estado === this.filtroActivo);
    }
  }
}
