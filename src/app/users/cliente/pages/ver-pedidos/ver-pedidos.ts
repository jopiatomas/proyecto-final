import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import { ClienteService } from '../../../../services/cliente.service';
import { PedidoResumenDTO, PedidoDetailDTO } from '../../../../models/app.models';

@Component({
  selector: 'app-ver-pedidos',
  imports: [Header, FooterCliente, CommonModule],
  templateUrl: './ver-pedidos.html',
  styleUrl: './ver-pedidos.css',
})
export class VerPedidos implements OnInit {
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
    
    this.clienteService.getPedidosActivos().subscribe({
      next: (pedidos) => {
        // Filtrar solo pedidos con estados activos
        const estadosActivos = ['PREPARACION', 'ENVIADO', 'PENDIENTE'];
        this.pedidos = pedidos
          .filter(pedido => estadosActivos.includes(pedido.estado))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Más nuevos arriba
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
        this.error = 'Error cargando los pedidos. Intenta nuevamente.';
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
    return estado === 'PENDIENTE';
  }
}
