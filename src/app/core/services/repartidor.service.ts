import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RepartidorDetailDTO {
  id: number;
  nombreYapellido: string;
  usuario: string;
  email: string;
  pais: string;
  tipoVehiculo: string;
  disponible: boolean;
  trabajando: boolean;
  zonas: string[];
  totalPedidosEntregados: number;
  calificacionPromedio: number;
  activo: boolean;
}

export interface PedidoRepartidorDTO {
  id: number;
  fecha: string;
  estado: string;
  total: number;
  restauranteNombre: string;
  clienteNombre: string;
  direccionEntrega: string;
  direccionRestaurante: string;
}

@Injectable({
  providedIn: 'root'
})
export class RepartidorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/repartidores';

  obtenerPerfil(): Observable<RepartidorDetailDTO> {
    return this.http.get<RepartidorDetailDTO>(`${this.apiUrl}/perfil`);
  }

  actualizarPerfil(perfilDTO: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, perfilDTO);
  }

  cambiarContrasenia(contraseniaDTO: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/contrasenia`, contraseniaDTO);
  }

  cambiarDisponibilidad(disponible: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/disponibilidad`, null, {
      params: { disponible: disponible.toString() }
    });
  }

  obtenerPedidosDisponibles(): Observable<PedidoRepartidorDTO[]> {
    return this.http.get<PedidoRepartidorDTO[]>(`${this.apiUrl}/pedidos-disponibles`);
  }

  aceptarPedido(pedidoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/${pedidoId}/tomar`, null);
  }

  obtenerPedidoActual(): Observable<PedidoRepartidorDTO> {
    return this.http.get<PedidoRepartidorDTO>(`${this.apiUrl}/pedido-actual`);
  }

  marcarComoEntregado(pedidoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos/${pedidoId}/entregar`, null);
  }

  obtenerHistorialEntregas(): Observable<PedidoRepartidorDTO[]> {
    return this.http.get<PedidoRepartidorDTO[]>(`${this.apiUrl}/historial`);
  }

  obtenerEstadisticas(): Observable<RepartidorDetailDTO> {
    return this.http.get<RepartidorDetailDTO>(`${this.apiUrl}/estadisticas`);
  }

  activarCuenta(): Observable<string> {
    return this.http.put(`${this.apiUrl}/activar`, null, { responseType: 'text' });
  }

  desactivarCuenta(): Observable<string> {
    return this.http.put(`${this.apiUrl}/desactivar`, null, { responseType: 'text' });
  }
}
