import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  RestauranteResumen, 
  RestauranteDetail,
  ProductoResumen, 
  ReseniaCreate, 
  ReseniaDetail,
  PedidoCreateDTO,
  PedidoDetailDTO,
  PedidoResumenDTO,
  DireccionDTO,
  Tarjeta
} from '../models/app.models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/clientes';

  // Headers con autenticación JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET /clientes/restaurantes - Obtener todos los restaurantes disponibles
  getRestaurantes(): Observable<RestauranteResumen[]> {
    return this.http.get<RestauranteResumen[]>(`${this.baseUrl}/restaurantes`, {
      headers: this.getAuthHeaders()
    });
  }

  // GET /clientes/ver-menu/{nombre} - Obtener menú de un restaurante por nombre
  getMenuRestaurante(nombre: string): Observable<ProductoResumen[]> {
    return this.http.get<ProductoResumen[]>(`${this.baseUrl}/ver-menu/${encodeURIComponent(nombre)}`, {
      headers: this.getAuthHeaders()
    });
  }

  // POST /clientes/resenias - Crear nueva reseña
  crearResenia(resenia: ReseniaCreate): Observable<ReseniaDetail> {
    return this.http.post<ReseniaDetail>(`${this.baseUrl}/resenias`, resenia, {
      headers: this.getAuthHeaders()
    });
  }

  // GET /clientes/restaurante/{nombre} - Obtener restaurante por nombre (con menú incluido)
  getRestauranteByNombre(nombre: string): Observable<RestauranteDetail> {
    return this.http.get<RestauranteDetail>(`${this.baseUrl}/restaurante/${encodeURIComponent(nombre)}`, {
      headers: this.getAuthHeaders()
    });
  }

  // POST /clientes/pedir - Crear nuevo pedido
  crearPedido(pedido: PedidoCreateDTO): Observable<PedidoDetailDTO> {
    return this.http.post<PedidoDetailDTO>(`${this.baseUrl}/pedir`, pedido, {
      headers: this.getAuthHeaders()
    });
  }

  // GET /direcciones - Obtener direcciones del cliente
  getDirecciones(): Observable<DireccionDTO[]> {
    const token = localStorage.getItem('token');
    return this.http.get<DireccionDTO[]>('http://localhost:8080/direcciones', {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
  }

  // GET /pagos - Obtener métodos de pago del cliente
  getMetodosPago(): Observable<Tarjeta[]> {
    const token = localStorage.getItem('token');
    return this.http.get<Tarjeta[]>('http://localhost:8080/pagos', {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    });
  }

  // GET /clientes/pedidos-activos - Obtener pedidos activos del cliente
  getPedidosActivos(): Observable<PedidoResumenDTO[]> {
    return this.http.get<PedidoResumenDTO[]>(`${this.baseUrl}/pedidos-activos`, {
      headers: this.getAuthHeaders()
    });
  }

  // GET /clientes/pedido/{id} - Obtener detalle de un pedido específico
  getPedidoDetalle(id: number): Observable<PedidoDetailDTO> {
    return this.http.get<PedidoDetailDTO>(`${this.baseUrl}/pedido/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // PUT /clientes/pedido/{id}/cancelar - Cancelar un pedido
  cancelarPedido(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/pedido/${id}/cancelar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // GET /clientes/historial-pedidos - Obtener historial completo de pedidos del cliente
  getPedidosHistorial(): Observable<PedidoResumenDTO[]> {
    return this.http.get<PedidoResumenDTO[]>(`${this.baseUrl}/historial-pedidos`, {
      headers: this.getAuthHeaders()
    });
  }
}