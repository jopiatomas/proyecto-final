import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { RepartidorService } from '../../../../core/services/repartidor.service';

@Component({
  selector: 'app-pedidos-disponibles',
  imports: [Header, FooterRepartidor, CommonModule],
  templateUrl: './pedidos-disponibles.html',
  styleUrl: './pedidos-disponibles.css',
})
export class PedidosDisponibles implements OnInit {
  private repartidorService = inject(RepartidorService);
  private router = inject(Router);

  pedidos = signal<any[]>([]);
  loading = signal(false);
  aceptandoPedido = signal<number | null>(null);
  filtroEstado = signal<string>('');
  pedidosFiltrados = signal<any[]>([]);

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.loading.set(true);
    this.repartidorService.obtenerPedidosDisponibles().subscribe({
      next: (pedidos) => {
        const pedidosMapeados = pedidos.map((pedido: any) => ({
          ...pedido,
          direccionEntrega: pedido.direccionEntrega || pedido.clienteDireccion || pedido.direccion || 'No especificada',
          restauranteDireccion: pedido.restauranteDireccion || pedido.direccionRestaurante || 'No especificada'
        }));
        
        this.pedidos.set(pedidosMapeados);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: (error) => {
        this.pedidos.set([]);
        this.loading.set(false);
      },
    });
  }

  aplicarFiltros() {
    let resultado = this.pedidos();

    if (this.filtroEstado()) {
      resultado = resultado.filter((p) =>
        p.estado.toLowerCase().includes(this.filtroEstado().toLowerCase()),
      );
    }

    this.pedidosFiltrados.set(resultado);
  }

  cambiarFiltro(estado: string) {
    this.filtroEstado.set(estado === this.filtroEstado() ? '' : estado);
    this.aplicarFiltros();
  }

  aceptarPedido(pedidoId: number) {
    this.aceptandoPedido.set(pedidoId);

    this.repartidorService.aceptarPedido(pedidoId).subscribe({
      next: () => {
        this.aceptandoPedido.set(null);
        this.router.navigate(['/repartidor/ver-pedido-actual']);
      },
      error: (error) => {
        alert('Error al aceptar el pedido. Intenta de nuevo.');
        this.aceptandoPedido.set(null);
      },
    });
  }

  volverAlPanel() {
    this.router.navigate(['/repartidor']);
  }
}
