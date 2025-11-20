import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  RestauranteResumen, 
  RestauranteDetail,
  ProductoResumen, 
  ReseniaCreate, 
  ReseniaDetail,
  PedidoCreate,
  PedidoDetail,
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
  crearPedido(pedido: PedidoCreate): Observable<PedidoDetail> {
    return this.http.post<PedidoDetail>(`${this.baseUrl}/pedir`, pedido, {
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
}