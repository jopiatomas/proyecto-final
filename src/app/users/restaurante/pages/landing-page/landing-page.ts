import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ProductoService, PedidoEnCursoDTO, PedidoItemDTO } from '../../../../core/services/producto.service';

type PedidoEstado = 'pendiente' | 'preparando' | 'listo' | 'enviado' | 'entregado';

@Component({
  selector: 'app-landing-page',
  imports: [Header, Footer, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  loading = true;
  errorMessage = '';
  pedidos: (PedidoEnCursoDTO & { estado: PedidoEstado })[] = [];
  selectedPedido: (PedidoEnCursoDTO & { estado: PedidoEstado; items?: PedidoItemDTO[] }) | null = null;
  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading = true;
    this.errorMessage = '';
    this.productoService.getPedidosEnCurso().subscribe({
      next: (data) => {
        this.pedidos = data.map(p => ({
          ...p,
          estado: (p.estado || '').toLowerCase() as PedidoEstado
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.errorMessage = 'Error al cargar los pedidos en curso';
        this.loading = false;
      }
    });
  }

  selectPedido(pedido: { id: number }) {
    const base = this.pedidos.find(p => p.id === pedido.id);
    if (base) this.selectedPedido = { ...base };
  }

  closePedido() {
    this.selectedPedido = null;
  }

  cambiarEstado(nuevoEstado: 'preparando' | 'listo' | 'enviado') {
    if (!this.selectedPedido) return;
    const id = this.selectedPedido.id;
    this.productoService.updateEstadoPedido(id, nuevoEstado).subscribe({
      next: () => {
        this.selectedPedido!.estado = nuevoEstado as PedidoEstado;
        const idx = this.pedidos.findIndex(p => p.id === id);
        if (idx !== -1) this.pedidos[idx].estado = nuevoEstado as PedidoEstado;
      },
      error: (err) => {
        console.error('Error actualizando estado:', err);
        alert('No se pudo actualizar el estado del pedido');
      }
    });
  }

  getEstadoLabel(estado: string): string {
    const key = (estado || '').toLowerCase();
    const labels: { [key: string]: string } = {
      pendiente: 'PENDIENTE',
      preparando: 'PREPARANDO',
      listo: 'LISTO',
      enviado: 'ENVIADO',
      entregado: 'ENTREGADO'
    };
    return labels[key] || key.toUpperCase();
  }
}
