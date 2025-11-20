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