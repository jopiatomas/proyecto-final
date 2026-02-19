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
    console.log('🔍 Obteniendo perfil...');
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  cambiarDisponibilidad(disponible: boolean): Observable<any> {
    console.log('📍 Enviando cambiarDisponibilidad:', disponible);
    return this.http.put<any>(`${this.apiUrl}/disponibilidad?disponible=${disponible}`, {});
  }

  desactivarDisponibilidad(): Observable<any> {
    console.log('📍 Enviando desactivarDisponibilidad');
    return this.http.put<any>(`${this.apiUrl}/desactivar`, {});
  }

  obtenerPedidosDisponibles(): Observable<any[]> {
    console.log('🔍 Obteniendo pedidos disponibles...');
    return this.http.get<any[]>(`${this.apiUrl}/pedidos-disponibles`);
  }

  obtenerPedidoActual(): Observable<any> {
    console.log('🔍 Obteniendo pedido actual...');
    return this.http.get<any>(`${this.apiUrl}/pedido-actual`);
  }

  aceptarPedido(pedidoId: number): Observable<any> {
    console.log('✅ Aceptando pedido:', pedidoId);
    return this.http.post<any>(`${this.apiUrl}/pedidos/${pedidoId}/tomar`, {});
  }

  marcarEntregado(pedidoId: number): Observable<any> {
    console.log('✅ Marcando como entregado:', pedidoId);
    return this.http.post<any>(`${this.apiUrl}/pedidos/${pedidoId}/entregar`, {});
  }

  obtenerHistorialEntregas(): Observable<any[]> {
    console.log('📜 Obteniendo historial de entregas...');
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  obtenerEstadisticas(): Observable<any> {
    console.log('📊 Obteniendo estadísticas...');
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }

  activarCuenta(): Observable<any> {
    console.log('✅ Activando cuenta...');
    return this.http.put<any>(`${this.apiUrl}/activar`, {});
  }

  desactivarCuenta(): Observable<any> {
    console.log('❌ Desactivando cuenta...');
    return this.http.put<any>(`${this.apiUrl}/desactivar`, {});
  }

  actualizarPerfil(datos: any): Observable<any> {
    console.log('✏️ Actualizando perfil...');
    return this.http.put<any>(`${this.apiUrl}/perfil`, datos);
  }

  cambiarContrasenia(datos: any): Observable<any> {
    console.log('🔐 Cambiando contraseña...');
    return this.http.put<any>(`${this.apiUrl}/contrasenia`, datos);
  }

  cambiarEstadoPedido(pedidoId: number, estado: string): Observable<any> {
    console.log('📍 Cambiando estado del pedido:', pedidoId, 'a:', estado);
    return this.http.put<any>(`${this.apiUrl}/pedidos/${pedidoId}/estado`, { estado });
  }
}
