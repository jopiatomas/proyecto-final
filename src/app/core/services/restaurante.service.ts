import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ActualizarPerfilRequest,
  ActualizarPerfilRestauranteRequest,
  PerfilUsuario,
} from '../models/app.models';
import { AuthService } from './auth-service';

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
  providedIn: 'root',
})
export class RestauranteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:8080/restaurantes'; // Endpoints para usuarios RESTAURANTE

  // Headers con autenticación JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  obtenerPerfil(): Observable<PerfilUsuario> {
    const headers = this.getHeaders();

    return this.http.get<any>(`${this.baseUrl}/perfiles`, { headers }).pipe(
      map((res) => {
        return {
          id: res.id,
          nombreYapellido: res.nombre,
          usuario: this.authService.currentUser()?.usuario ?? '',
          email: res.email,
          horaApertura: res.horaApertura,
          horaCierre: res.horaCierre,
        } as PerfilUsuario;
      })
    );
  }

  actualizarPerfil(datos: ActualizarPerfilRestauranteRequest) {
    return this.http.put(`${this.baseUrl}/perfil`, datos, {
      headers: this.getHeaders(),
      responseType: 'text',
    });
  }

  // Headers con autenticación JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // Métodos de productos
  getAllProductos(): Observable<ProductoDetailDTO[]> {
    return this.http.get<ProductoDetailDTO[]>(`${this.baseUrl}/productos`, {
      headers: this.getAuthHeaders(),
    });
  }

  crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
    return this.http.post<ProductoDetailDTO>(`${this.baseUrl}/productos`, producto, {
      headers: this.getAuthHeaders(),
    });
  }

  modificarProducto(
    idProducto: number,
    producto: ProductoModificarDTO
  ): Observable<ProductoDetailDTO> {
    return this.http.put<ProductoDetailDTO>(`${this.baseUrl}/productos/${idProducto}`, producto, {
      headers: this.getAuthHeaders(),
    });
  }

  eliminarProducto(idProducto: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/productos/${idProducto}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text',
    });
  }

  getProductoPorNombre(nombre: string): Observable<ProductoDetailDTO> {
    return this.http.get<ProductoDetailDTO>(
      `${this.baseUrl}/productos/${encodeURIComponent(nombre)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getPedidosEnCurso(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos-en-curso`);
  }

  getHistorialPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/historial-pedidos`);
  }

  cambiarEstadoPedido(idPedido: number, nuevoEstado: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/pedidos/${idPedido}/estado`, {
      estado: nuevoEstado,
    });
  }

  getPedidosCompletos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos-completo`);
  }

  // Métodos de direcciones
  getDirecciones(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/direcciones', {
      headers: this.getAuthHeaders(),
    });
  }

  crearDireccion(direccion: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/direcciones', direccion, {
      headers: this.getAuthHeaders(),
    });
  }

  modificarDireccion(id: number, direccion: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/direcciones/${id}`, direccion, {
      headers: this.getAuthHeaders(),
    });
  }

  eliminarDireccion(eliminarDTO: any): Observable<string> {
    return this.http.delete(`http://localhost:8080/direcciones`, {
      headers: this.getAuthHeaders(),
      body: eliminarDTO,
      responseType: 'text',
    });
  }

  // Método de balance
  getBalance(filtroDTO: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/balance`, filtroDTO, {
      headers: this.getAuthHeaders(),
    });
  }

  // Método para obtener estado del restaurante
  getEstado(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/estado`, {
      headers: this.getAuthHeaders(),
    });
  }

  getRestauranteById(id: number): Observable<Restaurante> {
    return new Observable((observer) => {
      observer.error(
        new Error('Método deprecado. Usar ClienteService para funcionalidades de cliente.')
      );
    });
  }
}
