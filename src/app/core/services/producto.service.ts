import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

// Pedidos
export interface PedidoItemDTO {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface PedidoEnCursoDTO {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  cliente?: string;
  direccion?: string;
}

export interface PedidoDetalleDTO extends PedidoEnCursoDTO {
  items?: PedidoItemDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/restaurante';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos del restaurante
getAllProductos(): Observable<ProductoDetailDTO[]> {
  return this.http.get<ProductoDetailDTO[]>(`${this.apiUrl}/producto`);
}

crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
  return this.http.post<ProductoDetailDTO>(`${this.apiUrl}/producto`, producto);
}

modificarProducto(idProducto: number, producto: ProductoModificarDTO): Observable<ProductoDetailDTO> {
  return this.http.put<ProductoDetailDTO>(`${this.apiUrl}/producto/${idProducto}`, producto);
}

eliminarProducto(idProducto: number): Observable<string> {
  return this.http.delete(`${this.apiUrl}/producto/${idProducto}`, {
    responseType: 'text'
  });
}

getProductoPorNombre(nombre: string): Observable<ProductoDetailDTO> {
  return this.http.get<ProductoDetailDTO>(`${this.apiUrl}/producto/${encodeURIComponent(nombre)}`);
}

// Pedidos - En curso
getPedidosEnCurso(): Observable<PedidoEnCursoDTO[]> {
  return this.http.get<PedidoEnCursoDTO[]>(`${this.apiUrl}/pedidosEnCurso`);
}

// Actualizar estado del pedido
updateEstadoPedido(id: number, estado: string): Observable<PedidoDetalleDTO> {
  // Backend espera los datos en la URL sin body y retorna detalle
  return this.http.put<PedidoDetalleDTO>(`${this.apiUrl}/pedidos/${id}/${estado}`, {});
}

// Obtener historial de pedidos del restaurante
getHistorialPedidos(): Observable<PedidoHistorialDTO[]> {
  return this.http.get<PedidoHistorialDTO[]>(`${this.apiUrl}/historialPedidos`);
}
}

export interface PedidoHistorialDTO {
  id: number;
  fecha: string; // LocalDateTime del backend
  estado: string;
  total: number;
}
