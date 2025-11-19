import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ProductoService, PedidoHistorialDTO } from '../../../../core/services/producto.service';

@Component({
  selector: 'app-historial-pedidos',
  imports: [Header, Footer, CommonModule, FormsModule],
  templateUrl: './historial-pedidos.html',
  styleUrl: './historial-pedidos.css',
})
export class HistorialPedidos implements OnInit {
  loading = true;
  pedidos: PedidoHistorialDTO[] = [];
  pedidosFiltrados: PedidoHistorialDTO[] = [];
  selectedPedido: PedidoHistorialDTO | null = null;
  errorMessage = '';

  // Filtros
  filtroId = '';
  filtroEstado = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading = true;
    this.errorMessage = '';

    this.productoService.getHistorialPedidos().subscribe({
      next: (pedidos) => {
        // Normalizar estado a minúsculas para estilos y filtros
        this.pedidos = pedidos.map(p => ({
          ...p,
          estado: (p.estado || '').toLowerCase()
        }));
        this.pedidosFiltrados = [...this.pedidos];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.errorMessage = 'Error al cargar el historial de pedidos';
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    this.pedidosFiltrados = this.pedidos.filter(pedido => {
      // Filtro por ID
      if (this.filtroId && !pedido.id.toString().includes(this.filtroId)) {
        return false;
      }

      // Filtro por estado
      if (this.filtroEstado && pedido.estado.toLowerCase() !== this.filtroEstado.toLowerCase()) {
        return false;
      }

      // Filtro por fecha desde
      if (this.filtroFechaDesde) {
        const fechaPedido = this.parseFecha(pedido.fecha);
        const fechaDesde = new Date(this.filtroFechaDesde);
        if (fechaPedido < fechaDesde) {
          return false;
        }
      }

      // Filtro por fecha hasta
      if (this.filtroFechaHasta) {
        const fechaPedido = this.parseFecha(pedido.fecha);
        const fechaHasta = new Date(this.filtroFechaHasta);
        if (fechaPedido > fechaHasta) {
          return false;
        }
      }

      return true;
    });
  }

  parseFecha(fecha: string): Date {
    // El backend devuelve LocalDateTime en formato ISO
    return new Date(fecha);
  }

  selectPedido(pedido: PedidoHistorialDTO) {
    this.selectedPedido = pedido;
  }

  closePedido() {
    this.selectedPedido = null;
  }

  getEstadoLabel(estado: string): string {
    const key = (estado || '').toLowerCase();
    const labels: { [key: string]: string } = {
      'entregado': 'ENTREGADO',
      'cancelado': 'CANCELADO'
    };
    return labels[key] || key.toUpperCase();
  }
}
