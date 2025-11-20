import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Forma que llega desde el backend (según consola: idCliente, resenia, puntuacion)
export interface ReseniaBackendDTO {
  idCliente: number;
  resenia: string;
  puntuacion: number;
}

// Forma normalizada para la UI
export interface ReseniaDTO {
  id: number; // índice o id derivado
  clienteNombre: string;
  comentario: string;
  calificacion: number; // 1-5
}

@Injectable({ providedIn: 'root' })
export class ReseniaService {
  private apiUrl = 'http://localhost:8080/restaurantes';

  constructor(private http: HttpClient) {}

  getResenias(): Observable<ReseniaBackendDTO[]> {
    return this.http.get<ReseniaBackendDTO[]>(`${this.apiUrl}/resenias`);
  }
}
