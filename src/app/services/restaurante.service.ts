import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api/restaurantes';

  getRestaurantes(): Observable<Restaurante[]> {
    return this.http.get<Restaurante[]>(this.apiUrl);
  }

  getRestauranteById(id: number): Observable<Restaurante> {
    return this.http.get<Restaurante>(`${this.apiUrl}/${id}`);
  }
}