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

  // Propiedades para modal de alerta
  mostrarModalAlerta = false;
  tituloAlerta = '';
  mensajeAlerta = '';
  tipoAlerta: 'info' | 'warning' | 'error' | 'success' = 'info';

  // Propiedades para modal de rating
  mostrarModalRating = false;
  pedidoACalificar: PedidoDetailDTO | null = null;
  calificacionRepartidor = 0;
  enviandoRating = false;

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
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        );
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
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

    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      this.clienteService.cancelarPedido(this.pedidoSeleccionado.id).subscribe({
        next: (mensaje) => {
          this.mostrarAlerta(
            'Pedido cancelado',
            mensaje || 'Pedido cancelado exitosamente',
            'success',
          );
          this.cargarPedidos(); // Recargar la lista
          this.pedidoSeleccionado = null; // Limpiar selección
          this.mostrarMenuOpciones = false;
        },
        error: (error) => {
          let mensajeError = 'Error al cancelar el pedido';
          if (error.error?.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            try {
              const errorObj = JSON.parse(error.error);
              mensajeError = errorObj.message || error.error;
            } catch {
              // Si no es JSON, usar el string directamente
              mensajeError = error.error;
            }
          }

          this.mostrarAlerta('Error', mensajeError, 'error');

          // Recargar la lista para actualizar estados
          this.cargarPedidos();
          this.pedidoSeleccionado = null;
          this.mostrarMenuOpciones = false;
        },
      });
    }
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'ENTREGADO':
        return '#28a745';
      case 'CANCELADO':
        return '#dc3545';
      default:
        return '#7b2cbf';
    }
  }

  formatearEstado(estado: string): string {
    switch (estado) {
      case 'PREPARACION':
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

  // Métodos para modal de alerta
  mostrarAlerta(
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'warning' | 'error' | 'success' = 'info',
  ) {
    this.tituloAlerta = titulo;
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.mostrarModalAlerta = true;
  }

  cerrarModalAlerta() {
    this.mostrarModalAlerta = false;
  }

  abrirModalRating(pedido: PedidoDetailDTO) {
    // Solo permitir rating para pedidos entregados
    if (pedido.estado !== 'ENTREGADO') {
      this.mostrarAlerta(
        'No disponible',
        'Solo puedes calificar repartidores de pedidos entregados',
        'info',
      );
      return;
    }

    this.pedidoACalificar = pedido;
    this.calificacionRepartidor = 0;
    this.mostrarModalRating = true;
  }

  cerrarModalRating() {
    this.mostrarModalRating = false;
    this.pedidoACalificar = null;
    this.calificacionRepartidor = 0;
  }

  enviarCalificacion() {
    if (!this.pedidoACalificar || this.calificacionRepartidor === 0) {
      this.mostrarAlerta('Error', 'Por favor selecciona una calificación', 'error');
      return;
    }

    this.enviandoRating = true;

    this.clienteService
      .calificarRepartidor(this.pedidoACalificar.id, this.calificacionRepartidor)
      .subscribe({
        next: () => {
          this.mostrarAlerta('Éxito', 'Repartidor calificado exitosamente', 'success');
          this.enviandoRating = false;
          this.cerrarModalRating();
          // No es necesario recargar, la calificación ya está guardada
        },
        error: (error: any) => {
          let mensajeError = 'Error al calificar el repartidor';
          if (error.error?.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            try {
              const errorObj = JSON.parse(error.error);
              mensajeError = errorObj.message || error.error;
            } catch {
              mensajeError = error.error;
            }
          }
          this.mostrarAlerta('Error', mensajeError, 'error');
          this.enviandoRating = false;
        },
      });
  }
}
