import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClienteDTO {
  id: number;
  usuario: string;
  nombreYapellido: string;
  email: string;
}

export interface ClienteModificarDTO {
  usuario: string;
  nombreYapellido: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminClienteService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/admin/clientes';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllClientes(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getClienteById(id: number): Observable<ClienteDTO> {
    return this.http.get<ClienteDTO>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  modificarCliente(id: number, datos: ClienteModificarDTO): Observable<ClienteDTO> {
    return this.http.put<ClienteDTO>(`${this.baseUrl}/${id}`, datos, {
      headers: this.getAuthHeaders()
    });
  }

  eliminarCliente(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}