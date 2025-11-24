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

  getAllClientes(): Observable<ClienteDTO[]> {
    return this.http.get<ClienteDTO[]>(this.baseUrl);
  }

  getClienteById(id: number): Observable<ClienteDTO> {
    return this.http.get<ClienteDTO>(`${this.baseUrl}/${id}`);
  }

  modificarCliente(id: number, datos: ClienteModificarDTO): Observable<ClienteDTO> {
    return this.http.put<ClienteDTO>(`${this.baseUrl}/${id}`, datos);
  }

  eliminarCliente(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
