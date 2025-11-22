import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PerfilUsuario, ActualizarPerfilRequest } from '../models/app.models';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private apiUrl = 'http://localhost:8080/clientes';

  constructor(private http: HttpClient) {}

  // Obtener perfil completo del usuario - GET /clientes/perfil
  obtenerPerfil(): Observable<PerfilUsuario> {
    const headers = this.getHeaders();
    console.log('🔐 Headers enviados a /clientes/perfil:', headers);
    console.log('🔑 Token en localStorage:', localStorage.getItem('token'));

    return this.http
      .get(`${this.apiUrl}/perfil`, {
        headers: headers,
        responseType: 'text',
      })
      .pipe(
        map((response: any) => {
          try {
            console.log(
              '📦 Respuesta raw del backend (primeros 500 chars):',
              response.substring(0, 500)
            );

            // Buscar la estructura básica que necesitamos
            const idMatch = response.match(/"id":(\d+)/);
            const usuarioMatch = response.match(/"usuario":"([^"]+)"/);
            const nombreMatch = response.match(/"nombreYapellido":"([^"]+)"/);
            const emailMatch = response.match(/"email":"([^"]+)"/);

            // Si encontramos los datos básicos, construir el objeto manualmente
            if (idMatch && usuarioMatch && nombreMatch) {
              const perfil: PerfilUsuario = {
                id: parseInt(idMatch[1]),
                usuario: usuarioMatch[1],
                nombreYapellido: nombreMatch[1],
                email: emailMatch ? emailMatch[1] : '',
              };

              console.log('✅ Perfil extraído manualmente:', perfil);
              return perfil;
            }

            // Si no, intentar parsear normalmente (fallback)
            throw new Error('No se pudieron extraer los datos del perfil');
          } catch (e) {
            console.error('❌ Error parsing response:', e);
            console.error('📝 Response text (primeros 500 chars):', response.substring(0, 500));
            throw e;
          }
        })
      );
  }

  // Actualizar perfil del usuario - PUT /clientes/perfil
  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<string> {
    return this.http.put(`${this.apiUrl}/perfil`, datos, {
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
}
