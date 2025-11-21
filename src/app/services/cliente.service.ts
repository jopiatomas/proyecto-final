import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  RestauranteResumen, 
  RestauranteDetail,
  ProductoResumen, 
  ReseniaCreate, 
  ReseniaDetail,
  PedidoCreate,
  PedidoDetail,
  DireccionDTO,
  Tarjeta,
  TarjetaRequest
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
    return this.http.get<DireccionDTO[]>('http://localhost:8080/direcciones', {
      headers: this.getAuthHeaders()
    });
  }

  // POST /direcciones - Crear nueva dirección
  crearDireccion(direccion: Omit<DireccionDTO, 'id'>): Observable<DireccionDTO> {
    return this.http.post<DireccionDTO>('http://localhost:8080/direcciones', direccion, {
      headers: this.getAuthHeaders()
    });
  }

  // PUT /direcciones/{id} - Modificar dirección existente
  modificarDireccion(id: number, direccion: Omit<DireccionDTO, 'id'>): Observable<DireccionDTO> {
    return this.http.put<DireccionDTO>(`http://localhost:8080/direcciones/${id}`, direccion, {
      headers: this.getAuthHeaders()
    });
  }

  // DELETE /direcciones - Eliminar dirección (requiere DireccionEliminarDTO en body)
  eliminarDireccion(direccionEliminar: { id: number; direccion?: string; codigoPostal?: string }): Observable<void> {
    return this.http.delete<void>('http://localhost:8080/direcciones', {
      headers: this.getAuthHeaders(),
      body: direccionEliminar
    });
  }

  // GET /pagos - Obtener métodos de pago del cliente
  getMetodosPago(): Observable<Tarjeta[]> {
    return this.http.get('http://localhost:8080/pagos', {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      map((response: any) => {
        try {
          // Intentar parsear el JSON manualmente
          const cleanResponse = response.trim();
          // Buscar el primer [ y el último ] válido
          const firstBracket = cleanResponse.indexOf('[');
          const lastBracket = cleanResponse.lastIndexOf(']');
          
          if (firstBracket !== -1 && lastBracket !== -1) {
            const jsonString = cleanResponse.substring(firstBracket, lastBracket + 1);
            return JSON.parse(jsonString);
          }
          
          return JSON.parse(cleanResponse);
        } catch (e) {
          console.error('Error parsing response:', e);
          console.error('Response text:', response);
          return [];
        }
      })
    );
  }

  // POST /pagos - Agregar nuevo método de pago
  agregarMetodoPago(tarjeta: TarjetaRequest): Observable<Tarjeta> {
    return this.http.post<Tarjeta>('http://localhost:8080/pagos', tarjeta, {
      headers: this.getAuthHeaders()
    });
  }

  // DELETE /pagos/{id-pago} - Eliminar método de pago
  eliminarMetodoPago(idPago: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/pagos/${idPago}`, {
      headers: this.getAuthHeaders()
    });
  }
}