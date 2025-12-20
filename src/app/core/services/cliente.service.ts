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
  PedidoDetailDTO,
  PedidoResumenDTO,
  DireccionDTO,
  Tarjeta,
  TarjetaRequest,
  RestauranteResumidoDTO,
  PerfilUsuario,
  ActualizarPerfilRequest,
} from '../models/app.models';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/clientes';

  // Headers con autenticación JWT
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token?.trim()}`, // Eliminar espacios si los hay
      'Content-Type': 'application/json',
    });
  }

  // GET /clientes/restaurantes - Obtener todos los restaurantes disponibles
  getRestaurantes(): Observable<RestauranteResumen[]> {
    return this.http.get<RestauranteResumen[]>(`${this.baseUrl}/restaurantes`, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /clientes/ver-menu/{nombre} - Obtener menú de un restaurante por nombre
  getMenuRestaurante(nombre: string): Observable<ProductoResumen[]> {
    return this.http.get<ProductoResumen[]>(
      `${this.baseUrl}/ver-menu/${encodeURIComponent(nombre)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // POST /clientes/resenias - Crear nueva reseña
  crearResenia(resenia: ReseniaCreate): Observable<ReseniaDetail> {
    return this.http.post<ReseniaDetail>(`${this.baseUrl}/resenias`, resenia, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /clientes/restaurante/{usuario} - Obtener restaurante por usuario (con menú incluido)
  getRestauranteByNombre(usuario: string): Observable<RestauranteDetail> {
    return this.http.get<RestauranteDetail>(
      `${this.baseUrl}/restaurante/${encodeURIComponent(usuario)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // POST /clientes/pedir - Crear nuevo pedido
  crearPedido(pedido: PedidoCreate): Observable<PedidoDetailDTO> {
    return this.http.post<PedidoDetailDTO>(`${this.baseUrl}/pedir`, pedido, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /direcciones - Obtener direcciones del cliente
  getDirecciones(): Observable<DireccionDTO[]> {
    return this.http.get<DireccionDTO[]>('http://localhost:8080/direcciones', {
      headers: this.getAuthHeaders(),
    });
  }

  // POST /direcciones - Crear nueva dirección
  crearDireccion(direccion: Omit<DireccionDTO, 'id'>): Observable<DireccionDTO> {
    return this.http.post<DireccionDTO>('http://localhost:8080/direcciones', direccion, {
      headers: this.getAuthHeaders(),
    });
  }

  // PUT /direcciones/{id} - Modificar dirección existente
  modificarDireccion(id: number, direccion: Omit<DireccionDTO, 'id'>): Observable<DireccionDTO> {
    return this.http.put<DireccionDTO>(`http://localhost:8080/direcciones/${id}`, direccion, {
      headers: this.getAuthHeaders(),
    });
  }

  // DELETE /direcciones - Eliminar dirección usando DireccionEliminarDTO
  eliminarDireccion(direccionEliminar: {
    id: number;
    direccion: string;
    codigoPostal: string;
  }): Observable<void> {
    return this.http.delete<void>('http://localhost:8080/direcciones', {
      headers: this.getAuthHeaders(),
      body: direccionEliminar,
    });
  }

  // GET /pagos - Obtener métodos de pago del cliente
  getMetodosPago(): Observable<Tarjeta[]> {
    return this.http.get<Tarjeta[]>('http://localhost:8080/pagos', {
      headers: this.getAuthHeaders(),
    });
  }

  // POST /pagos - Agregar nuevo método de pago
  agregarMetodoPago(tarjeta: TarjetaRequest): Observable<Tarjeta> {
    return this.http.post<Tarjeta>('http://localhost:8080/pagos', tarjeta, {
      headers: this.getAuthHeaders(),
    });
  }

  // DELETE /pagos/{id-pago} - Eliminar método de pago
  eliminarMetodoPago(idPago: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/pagos/${idPago}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /clientes/pedidos-activos - Obtener pedidos activos del cliente
  getPedidosActivos(): Observable<PedidoResumenDTO[]> {
    return this.http.get<PedidoResumenDTO[]>(`${this.baseUrl}/pedidos-activos`, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /clientes/pedido/{id} - Obtener detalle de un pedido específico
  getPedidoDetalle(id: number): Observable<PedidoDetailDTO> {
    return this.http.get<PedidoDetailDTO>(`${this.baseUrl}/pedido/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // PUT /clientes/pedido/{id}/cancelar - Cancelar un pedido
  cancelarPedido(id: number): Observable<string> {
    return this.http.put(
      `${this.baseUrl}/pedido/${id}/cancelar`,
      {},
      {
        headers: this.getAuthHeaders(),
        responseType: 'text',
      }
    );
  }

  // GET /clientes/historial-pedidos - Obtener historial completo de pedidos del cliente
  getPedidosHistorial(): Observable<PedidoDetailDTO[]> {
    return this.http.get<PedidoDetailDTO[]>(`${this.baseUrl}/historial-pedidos`, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /clientes/perfil - Obtener perfil completo del usuario
  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http
      .get(`${this.baseUrl}/perfil`, {
        headers: this.getAuthHeaders(),
        responseType: 'text',
      })
      .pipe(
        map((response: string) => {
          // Extraer valores directamente con regex (sin parsear el JSON completo)
          const id = parseInt(response.match(/"id":(\d+)/)?.[1] || '0');
          const usuario = response.match(/"usuario":"([^"]+)"/)?.[1] || '';
          const nombreYapellido = response.match(/"nombreYapellido":"([^"]+)"/)?.[1] || '';
          const email = response.match(/"email":"([^"]+)"/)?.[1] || '';

          return { id, usuario, nombreYapellido, email };
        })
      );
  }

  // PUT /clientes/perfil - Actualizar perfil del usuario
  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<string> {
    return this.http.put(`${this.baseUrl}/perfil`, datos, {
      headers: this.getAuthHeaders(),
      responseType: 'text',
    });
  }

  // POST /clientes/agregar-listafav/{id-restaurante} - Agregar restaurante a favoritos
  agregarRestauranteFavorito(idRestaurante: number): Observable<RestauranteResumidoDTO> {
    return this.http.post<RestauranteResumidoDTO>(
      `${this.baseUrl}/agregar-listafav/${idRestaurante}`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // DELETE /clientes/eliminar-listafav/{id-restaurante} - Eliminar restaurante de favoritos
  eliminarRestauranteFavorito(idRestaurante: number): Observable<RestauranteResumidoDTO> {
    return this.http.delete<RestauranteResumidoDTO>(
      `${this.baseUrl}/eliminar-listafav/${idRestaurante}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  // GET /clientes/mostrar-listafav - Obtener lista de restaurantes favoritos
  getRestaurantesFavoritos(): Observable<RestauranteResumidoDTO[]> {
    return this.http.get<RestauranteResumidoDTO[]>(`${this.baseUrl}/mostrar-listafav`, {
      headers: this.getAuthHeaders(),
    });
  }
}
