import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO basado en el backend
export interface RestauranteDetailDTO {
  id: number;
  usuario: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface RestauranteModificarDTO {
  usuario?: string;
  nombre?: string;
  contraseniaActual?: string;
  contraseniaNueva?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'http://localhost:8080/restaurante';

  constructor(private http: HttpClient) {}

  // Obtener perfil del restaurante
  getPerfil(): Observable<RestauranteDetailDTO> {
    return this.http.get<RestauranteDetailDTO>(`${this.apiUrl}/perfil`);
  }

  // Modificar usuario y/o nombre del restaurante
  modificarPerfil(data: RestauranteModificarDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/perfil`, data, { responseType: 'text' });
  }

  // Cambiar contraseña del restaurante
  cambiarContrasenia(data: RestauranteModificarDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/contrasenia`, data, { responseType: 'text' });
  }
}
