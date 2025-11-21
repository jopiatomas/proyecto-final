import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteDTO {
  id: number;
  usuario: string;
  nombreYapellido: string;
  email?: string;
  telefono?: string;
}

export interface ClienteModificarDTO {
  usuario: string; // posible nuevo usuario
  nombreYapellido: string; // campo requerido por backend
}

@Injectable({ providedIn: 'root' })
export class AdminClienteService {
  private apiUrl = 'http://localhost:8080/admin/clientes';

  constructor(private http: HttpClient) {}

  getAllClientes(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }


  modificarCliente(usuarioActual: string, data: ClienteModificarDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/${encodeURIComponent(usuarioActual)}`, data, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  eliminarCliente(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text', headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
