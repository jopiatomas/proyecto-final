import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoCrearDTO {
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

export interface ProductoModificarDTO {
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

export interface ProductoDetailDTO {
  id: number;
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = 'http://localhost:8080/restaurante';

  constructor(private http: HttpClient) {}

  // Obtener todos los productos del restaurante
  getAllProductos(): Observable<ProductoDetailDTO[]> {
    return this.http.get<ProductoDetailDTO[]>(`${this.apiUrl}/producto`);
  }

  // Crear un nuevo producto
  crearProducto(producto: ProductoCrearDTO): Observable<ProductoDetailDTO> {
    return this.http.post<ProductoDetailDTO>(`${this.apiUrl}/producto`, producto);
  }

  // Modificar un producto existente
  modificarProducto(idProducto: number, producto: ProductoModificarDTO): Observable<ProductoDetailDTO> {
    return this.http.put<ProductoDetailDTO>(`${this.apiUrl}/producto/${idProducto}`, producto);
  }

  // Eliminar un producto
  eliminarProducto(idProducto: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/producto/${idProducto}`, { responseType: 'text' });
  }

  // Obtener detalle de producto por nombre (el backend expone este endpoint)
  getProductoPorNombre(nombre: string): Observable<ProductoDetailDTO> {
    return this.http.get<ProductoDetailDTO>(`${this.apiUrl}/producto/${encodeURIComponent(nombre)}`);
  }
}
