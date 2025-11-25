import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PerfilUsuario, ActualizarPerfilRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private apiUrl = 'http://localhost:8080/clientes';

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<PerfilUsuario> {
    const headers = this.getHeaders();

    return this.http.get(`${this.apiUrl}/perfil`, {
      headers,
      responseType: 'text'
    }).pipe(
      map((response: string) => {
        // Extraer valores directamente con regex (sin parsear el JSON completo)
        const id = parseInt(response.match(/"id":(\d+)/)?.[1] || '0');
        const usuario = response.match(/"usuario":"([^"]+)"/)?.[1] || '';
        const nombreYapellido = response.match(/"nombreYapellido":"([^"]+)"/)?.[1] || '';
        const email = response.match(/"email":"([^"]+)"/)?.[1] || '';

        return { id, usuario, nombreYapellido, email };
      })
    );
  }

  // Actualizar perfil del usuario - PUT /clientes/perfil
  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/perfil`, datos, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Cambiar contraseña del usuario - PUT /clientes/cambiar-contrasenia
  cambiarContrasenia(datos: { contraseniaActual: string, contraseniaNueva: string, confirmarContrasenia: string }): Observable<string> {
    return this.http.put(`${this.apiUrl}/nueva-contrasenia`, datos, {
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