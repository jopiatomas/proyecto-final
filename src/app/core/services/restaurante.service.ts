import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para funcionalidad de restaurante
export interface RestauranteProfile {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  categoria?: string;
}

// Interfaces para productos
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

export interface ProductoResumenDTO {
  id: number;
  nombre: string;
  precio: number;
}

// Interface para pedidos
export interface Pedido {
  id: number;
  fecha: string;
  total: number;
  estado: string;
  cliente?: string;
  productos?: any[];
  detalles?: any[];
}

// Interface para compatibilidad con código anterior (DEPRECATED)
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
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/restaurantes'; // Endpoints para usuarios RESTAURANTE

  // Headers con autenticación JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Métodos de productos
  getAllProductos(): Observable<ProductoResumenDTO[]> {
    return this.http.get<ProductoResumenDTO[]>(`${this.baseUrl}/productos`, {
      headers: this.getAuthHeaders()
    });
  }

  getProductoPorNombre(nombre: string): Observable<ProductoDetailDTO> {
    const buscarDTO = { nombre: nombre };
    return this.http.post<ProductoDetailDTO>(`${this.baseUrl}/productos/buscar`, buscarDTO, {
      headers: this.getAuthHeaders()
    });
  }

  crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
    return this.http.post<ProductoDetailDTO>(`${this.baseUrl}/productos`, producto, {
      headers: this.getAuthHeaders()
    });
  }

  modificarProducto(id: number, producto: ProductoModificarDTO): Observable<ProductoDetailDTO> {
    return this.http.put<ProductoDetailDTO>(`${this.baseUrl}/productos/${id}`, producto, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarProducto(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/productos/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
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
    return this.http.post<any>(`${this.baseUrl}/balance`, filtroDTO, {
      headers: this.getAuthHeaders()
    });
  }

  // Métodos de pedidos
  getHistorialPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos`, {
      headers: this.getAuthHeaders()
    });
  }

  getPedidosEnCurso(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos/en-curso`, {
      headers: this.getAuthHeaders()
    });
  }

  cambiarEstadoPedido(idPedido: number, estado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/pedidos/${idPedido}/estado`, { estado }, {
      headers: this.getAuthHeaders()
    });
  }

  // TODO: Implementar otros endpoints cuando sea necesario
  // GET /restaurantes/perfil - Obtener perfil del restaurante
  // PUT /restaurantes/perfil - Actualizar perfil del restaurante
  // GET /restaurantes/pedidos - Ver pedidos del restaurante

  // Método para compatibilidad con código anterior (DEPRECATED)
  getRestauranteById(id: number): Observable<Restaurante> {
    return new Observable(observer => {
      observer.error(new Error('Método deprecado. Usar ClienteService para funcionalidades de cliente.'));
    });
  }
}