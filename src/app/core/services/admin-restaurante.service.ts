import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestaurantePendienteDTO, RechazarRestauranteDTO } from '../models/app.models';

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
    return this.http.get<RestauranteAdminDTO[]>(`${this.apiUrl}/restaurantes`);
  }

  modificarRestaurante(usuarioActual: string, data: RestauranteModificarDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/restaurantes/${encodeURIComponent(usuarioActual)}`, data, { responseType: 'text' });
  }

  eliminarRestaurante(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/restaurantes/${id}`, { responseType: 'text' });
  }

  getReseniasRestaurante(idRestaurante: number): Observable<ReseniaAdminDTO[]> {
    return this.http.get<ReseniaAdminDTO[]>(`${this.apiUrl}/ver-resenias-restaurante/${idRestaurante}`);
  }

  eliminarResenia(idResenia: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eliminar-resenia/${idResenia}`, { responseType: 'text' });
  }

  getPendientes(): Observable<RestaurantePendienteDTO[]> {
    return this.http.get<RestaurantePendienteDTO[]>(`${this.apiUrl}/restaurantes/pendientes`);
  }

  countPendientes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/restaurantes/pendientes/count`);
  }

  getRechazados(): Observable<RestaurantePendienteDTO[]> {
    return this.http.get<RestaurantePendienteDTO[]>(`${this.apiUrl}/restaurantes/rechazados`);
  }

  aprobarRestaurante(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/restaurantes/${id}/aprobar`, {}, { responseType: 'text' });
  }

  rechazarRestaurante(id: number, data: RechazarRestauranteDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/restaurantes/${id}/rechazar`, data, { responseType: 'text' });
  }
}
