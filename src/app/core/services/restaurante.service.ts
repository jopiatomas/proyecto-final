import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para Productos
export interface ProductoCrearDTO {
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

export interface RestauranteProfile {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  categoria?: string;
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

export interface ProductoResumenDTO {
  id: number;
  nombre: string;
  precio: number;
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

export interface Restaurante {
  id: number;
  nombre: string;
  categoria: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  horarios?: string;
  calificacion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  
  private apiUrl = 'http://localhost:8080/restaurantes';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ===== MÉTODOS DE PRODUCTOS =====
  
  getAllProductos(): Observable<ProductoDetailDTO[]> {
    return this.http.get<ProductoDetailDTO[]>(`${this.apiUrl}/productos`, {
      headers: this.getAuthHeaders()
    });
  }

  crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
    return this.http.post<ProductoDetailDTO>(`${this.apiUrl}/productos`, producto, {
      headers: this.getAuthHeaders()
    });
  }

  modificarProducto(idProducto: number, producto: ProductoModificarDTO): Observable<ProductoDetailDTO> {
    return this.http.put<ProductoDetailDTO>(`${this.apiUrl}/productos/${idProducto}`, producto, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarProducto(idProducto: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/productos/${idProducto}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  getProductoPorNombre(nombre: string): Observable<ProductoDetailDTO> {
    return this.http.get<ProductoDetailDTO>(`${this.apiUrl}/productos/${encodeURIComponent(nombre)}`, {
      headers: this.getAuthHeaders()
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

  getPedidosCompletos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos-completo`);
  }

  // Métodos de direcciones
  getDirecciones(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/direcciones', {
      headers: this.getAuthHeaders()
    });
  }

  crearDireccion(direccion: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/direcciones', direccion, {
      headers: this.getAuthHeaders()
    });
  }

  modificarDireccion(id: number, direccion: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/direcciones/${id}`, direccion, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarDireccion(eliminarDTO: any): Observable<string> {
    return this.http.delete(`http://localhost:8080/direcciones`, {
      headers: this.getAuthHeaders(),
      body: eliminarDTO,
      responseType: 'text'
    });
  }

  // Método de balance
  getBalance(filtroDTO: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/balance`, filtroDTO, {
      headers: this.getAuthHeaders()
    });
  }

  // Método para compatibilidad con código anterior (DEPRECATED)
    getRestauranteById(id: number): Observable<Restaurante> {
      return new Observable(observer => {
        observer.error(new Error('Método deprecado. Usar ClienteService para funcionalidades de cliente.'));
      });
    }
}
