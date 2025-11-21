import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RestauranteAdminDTO {
  id: number;
  usuario: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface RestauranteModificarDTO {
  usuario: string;
  nombreRestaurante: string;
}

export interface ReseniaAdminDTO {
  id: number;
  idCliente: number;
  clienteNombre?: string;
  resenia: string;
  puntuacion: number;
  fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminRestauranteService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) {}

  getAllRestaurantes(): Observable<RestauranteAdminDTO[]> {
    return this.http.get<RestauranteAdminDTO[]>(`${this.apiUrl}/restaurantes`, { headers: this.getAuthHeaders() });
  }

  modificarRestaurante(usuarioActual: string, data: RestauranteModificarDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/restaurantes/${encodeURIComponent(usuarioActual)}`, data, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  eliminarRestaurante(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/restaurantes/${id}`, { responseType: 'text', headers: this.getAuthHeaders() });
  }

  getReseniasRestaurante(idRestaurante: number): Observable<ReseniaAdminDTO[]> {
    return this.http.get<ReseniaAdminDTO[]>(`${this.apiUrl}/ver-resenias-restaurante/${idRestaurante}`, { headers: this.getAuthHeaders() });
  }

  eliminarResenia(idResenia: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eliminar-resenia/${idResenia}`, { responseType: 'text', headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
