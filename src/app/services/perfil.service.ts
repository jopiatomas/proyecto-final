import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilUsuario, ActualizarPerfilRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'http://localhost:8080/clientes';

  constructor(private http: HttpClient) {}

  // Obtener perfil completo del usuario - GET /clientes/perfil
  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${this.apiUrl}/perfil`, {
      headers: this.getHeaders()
    });
  }

  // Actualizar perfil del usuario - PUT /clientes/perfil
  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/perfil`, datos, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Headers con autenticación JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}