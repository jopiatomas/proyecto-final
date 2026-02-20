import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RepartidorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/repartidores';

  obtenerPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  cambiarDisponibilidad(disponible: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/disponibilidad?disponible=${disponible}`, {});
  }

  desactivarDisponibilidad(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/desactivar`, {});
  }

  obtenerPedidosDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos-disponibles`);
  }

  obtenerPedidoActual(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pedido-actual`);
  }

  aceptarPedido(pedidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pedidos/${pedidoId}/tomar`, {});
  }

  marcarEntregado(pedidoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pedidos/${pedidoId}/entregar`, {});
  }

  obtenerHistorialEntregas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  obtenerEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }

  activarCuenta(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/activar`, {});
  }

  desactivarCuenta(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/desactivar`, {});
  }

  actualizarPerfil(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/perfil`, datos);
  }

  cambiarContrasenia(datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/contrasenia`, datos);
  }

  cambiarEstadoPedido(pedidoId: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pedidos/${pedidoId}/estado`, { estado });
  }
}
