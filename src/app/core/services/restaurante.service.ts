import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ActualizarPerfilRequest, ActualizarPerfilRestauranteRequest, PedidoDetailDTO, PerfilUsuario } from '../models/app.models';
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
  providedIn: 'root'
})
export class RestauranteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'http://localhost:8080/restaurantes'; // Endpoints para usuarios RESTAURANTE

  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<any>(`${this.baseUrl}/perfiles`)
      .pipe(
        map((res) => {
          return {
            id: res.id,
            nombreYapellido: res.nombre,
            usuario: this.authService.currentUser()?.usuario ?? '',
            email: res.email
          } as PerfilUsuario;
        })
      );
  }

  actualizarPerfil(datos: ActualizarPerfilRestauranteRequest) {
    return this.http.put(`${this.baseUrl}/perfil`, datos, { responseType: 'text' });
  }

  // Métodos de productos
  getAllProductos(): Observable<ProductoDetailDTO[]> {
    return this.http.get<ProductoDetailDTO[]>(`${this.baseUrl}/productos`);
  }

  crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
    return this.http.post<ProductoDetailDTO>(`${this.baseUrl}/productos`, producto);
  }

  modificarProducto(idProducto: number, producto: ProductoModificarDTO): Observable<ProductoDetailDTO> {
    return this.http.put<ProductoDetailDTO>(`${this.baseUrl}/productos/${idProducto}`, producto);
  }

  eliminarProducto(idProducto: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/productos/${idProducto}`, { responseType: 'text' });
  }

  getProductoPorNombre(nombre: string): Observable<ProductoDetailDTO> {
    return this.http.get<ProductoDetailDTO>(`${this.baseUrl}/productos/${encodeURIComponent(nombre)}`);
  }

  getPedidosEnCurso(): Observable<PedidoDetailDTO[]> {
    return this.http.get<PedidoDetailDTO[]>(`${this.baseUrl}/pedidos-en-curso`);
  }

  getHistorialPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/historial-pedidos`);
  }

  cambiarEstadoPedido(idPedido: number, nuevoEstado: string): Observable<PedidoDetailDTO> {
    return this.http.put<PedidoDetailDTO>(`${this.baseUrl}/pedidos/${idPedido}/estado`, { estado: nuevoEstado });
  }

  getPedidosCompletos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos-completo`);
  }

  // Métodos de direcciones
  getDirecciones(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/direcciones');
  }

  crearDireccion(direccion: any): Observable<any> {
    return this.http.post<any>('http://localhost:8080/direcciones', direccion);
  }

  modificarDireccion(id: number, direccion: any): Observable<any> {
    return this.http.put<any>(`http://localhost:8080/direcciones/${id}`, direccion);
  }

  eliminarDireccion(eliminarDTO: any): Observable<string> {
    return this.http.delete(`http://localhost:8080/direcciones`, {
      body: eliminarDTO,
      responseType: 'text'
    });
  }

  // Método de balance
  getBalance(filtroDTO: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/balance`, filtroDTO);
  }

  getRestauranteById(id: number): Observable<Restaurante> {
    return new Observable(observer => {
      observer.error(new Error('Método deprecado. Usar ClienteService para funcionalidades de cliente.'));
    });
  }

  getEstado(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mi-estado`);
  }
}
