import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { RestauranteService } from '../../../../core/services/restaurante.service';
import { FooterRestaurante } from "../../components/footer/footer";
import { PedidoDetailDTO } from '../../../../core/models/app.models';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [Header, CommonModule, FooterRestaurante],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  pedidos = signal<PedidoDetailDTO[]>([]);
  pedidoSeleccionado = signal<PedidoDetailDTO | null>(null);
  estadoNuevo = signal<string | null>(null);

  constructor(private restauranteService: RestauranteService) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.restauranteService.getPedidosEnCurso().subscribe({
      next: (pedidos: PedidoDetailDTO[]) => {
        this.pedidos.set(pedidos);
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
      }
    });
  }

  verDetalle(pedido: PedidoDetailDTO) {
    this.pedidoSeleccionado.set(pedido);
    this.estadoNuevo.set(null);
  }

  cerrarDetalle() {
    this.pedidoSeleccionado.set(null);
    this.estadoNuevo.set(null);
  }

  seleccionarEstado(estado: string) {
    this.estadoNuevo.set(estado);
  }

  confirmarCambio() {
    const pedido = this.pedidoSeleccionado();
    const estado = this.estadoNuevo();
    
    if (pedido && estado) {
      this.restauranteService.cambiarEstadoPedido(pedido.id, estado).subscribe({
        next: (pedidoActualizado: PedidoDetailDTO) => {
          if (estado === 'CANCELADO' || estado === 'ENTREGADO') {
            const pedidosActualizados = this.pedidos().filter(p => p.id !== pedido.id);
            this.pedidos.set(pedidosActualizados);
            this.cerrarDetalle();
          } else {
            const pedidosActualizados = this.pedidos().map(p => 
              p.id === pedido.id ? pedidoActualizado : p
            );
            this.pedidos.set(pedidosActualizados);
            this.pedidoSeleccionado.set(pedidoActualizado);
            this.estadoNuevo.set(null);
          }
        },
        error: (error: any) => {
          console.error('Error al cambiar estado:', error);
        }
      });
    }
  }
}