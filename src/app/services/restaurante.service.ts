import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para cuando implementemos funcionalidad de restaurante
export interface RestauranteProfile {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  categoria?: string;
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

  // TODO: Implementar cuando tengamos los endpoints del backend para restaurantes
  // Ejemplos de endpoints que probablemente necesitaremos:
  
  // GET /restaurantes/perfil - Obtener perfil del restaurante
  // getPerfil(): Observable<RestauranteProfile> {
  //   return this.http.get<RestauranteProfile>(`${this.baseUrl}/perfil`, {
  //     headers: this.getAuthHeaders()
  //   });
  // }

  // PUT /restaurantes/perfil - Actualizar perfil del restaurante
  // actualizarPerfil(datos: any): Observable<RestauranteProfile> {
  //   return this.http.put<RestauranteProfile>(`${this.baseUrl}/perfil`, datos, {
  //     headers: this.getAuthHeaders()
  //   });
  // }

  // GET /restaurantes/pedidos - Ver pedidos del restaurante
  // POST /restaurantes/productos - Agregar producto al menú
  // PUT /restaurantes/productos/{id} - Actualizar producto
  // DELETE /restaurantes/productos/{id} - Eliminar producto

  // Método para compatibilidad con código anterior (DEPRECATED)
  getRestauranteById(id: number): Observable<Restaurante> {
    return new Observable(observer => {
      observer.error(new Error('Método deprecado. Usar ClienteService para funcionalidades de cliente.'));
    });
  }
}