import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

interface PedidoItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: number;
  cliente: string;
  direccion: string;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'preparando' | 'listo' | 'enviado' | 'entregado';
  items: PedidoItem[];
}

@Component({
  selector: 'app-landing-page',
  imports: [Header, Footer, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  loading = true;
  pedidos: Pedido[] = [];
  selectedPedido: Pedido | null = null;

  ngOnInit() {
    // Simular carga de datos
    setTimeout(() => {
      this.pedidos = [
        {
          id: 1001,
          cliente: 'Juan Pérez',
          direccion: 'Av. Principal 123, Depto 5A',
          total: 4500,
          fecha: '12/11/2025 14:30',
          estado: 'pendiente',
          items: [
            { id: 1, nombre: 'Pizza Napolitana', cantidad: 1, precio: 2500 },
            { id: 2, nombre: 'Coca Cola 1.5L', cantidad: 2, precio: 1000 }
          ]
        },
        {
          id: 1002,
          cliente: 'María González',
          direccion: 'Calle 45 #678',
          total: 3200,
          fecha: '12/11/2025 14:45',
          estado: 'preparando',
          items: [
            { id: 3, nombre: 'Hamburguesa Completa', cantidad: 2, precio: 1600 }
          ]
        },
        {
          id: 1003,
          cliente: 'Carlos Rodríguez',
          direccion: 'Paseo del Sol 234',
          total: 5800,
          fecha: '12/11/2025 15:00',
          estado: 'listo',
          items: [
            { id: 4, nombre: 'Milanesa con Papas', cantidad: 1, precio: 3500 },
            { id: 5, nombre: 'Ensalada Caesar', cantidad: 1, precio: 1800 },
            { id: 6, nombre: 'Agua Mineral', cantidad: 1, precio: 500 }
          ]
        },
        {
          id: 1004,
          cliente: 'Ana Martínez',
          direccion: 'Ruta 9 Km 5',
          total: 2800,
          fecha: '12/11/2025 15:15',
          estado: 'enviado',
          items: [
            { id: 7, nombre: 'Empanadas (docena)', cantidad: 1, precio: 2800 }
          ]
        }
      ];
      this.loading = false;
    }, 1000);
  }

  selectPedido(pedido: Pedido) {
    this.selectedPedido = pedido;
  }

  closePedido() {
    this.selectedPedido = null;
  }

  cambiarEstado(nuevoEstado: 'preparando' | 'listo' | 'enviado') {
    if (this.selectedPedido) {
      // El restaurante no puede asignar 'pendiente' ni 'entregado'
      this.selectedPedido.estado = nuevoEstado;
      // Actualizar el pedido en la lista
      const index = this.pedidos.findIndex(p => p.id === this.selectedPedido!.id);
      if (index !== -1) {
        this.pedidos[index].estado = nuevoEstado;
      }
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'preparando': 'Preparando',
      'listo': 'Listo',
      'enviado': 'Enviado',
      'entregado': 'Entregado'
    };
    return labels[estado] || estado;
  }
}
