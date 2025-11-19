import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para Productos
export interface ProductoCrearDTO {
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

export interface ProductoModificarDTO {
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

export interface ProductoDetailDTO {
  id: number;
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

// Interfaces para Pedidos
export interface DetallePedidoDTO {
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  nombreRestaurante?: string;
  idCliente?: number;
  detalles: DetallePedidoDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'http://localhost:8080/restaurantes';

  constructor(private http: HttpClient) {}

  // ===== MÉTODOS DE PRODUCTOS =====
  
  getAllProductos(): Observable<ProductoDetailDTO[]> {
    return this.http.get<ProductoDetailDTO[]>(`${this.apiUrl}/productos`);
  }

  crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
    return this.http.post<ProductoDetailDTO>(`${this.apiUrl}/productos`, producto);
  }

  modificarProducto(idProducto: number, producto: ProductoModificarDTO): Observable<ProductoDetailDTO> {
    return this.http.put<ProductoDetailDTO>(`${this.apiUrl}/productos/${idProducto}`, producto);
  }

  eliminarProducto(idProducto: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/productos/${idProducto}`, {
      responseType: 'text'
    });
  }

  // ===== MÉTODOS DE PEDIDOS =====

  getPedidosEnCurso(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos-en-curso`);
  }

  getHistorialPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/historial-pedidos`);
  }

  cambiarEstadoPedido(idPedido: number, nuevoEstado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/pedidos/${idPedido}/estado`, { estado: nuevoEstado });
  }
}
