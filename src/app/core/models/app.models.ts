export interface LoginRequest {
  usuario: string;
  contrasenia: string;
}

export interface RegisterRequest {
  usuario: string;
  contrasenia: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  token: string;
}

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  rol: 'CLIENTE' | 'RESTAURANTE' | 'ADMIN';
  email: string;
  telefono?: string;
  direccion?: string;
  exp?: number;
}

// Interfaces para perfil de usuario (ClienteDetailDto del backend)
export interface PerfilUsuario {
  id: number;
  nombreYapellido: string;
  usuario: string;
  email: string;
}

export interface ActualizarPerfilRequest {
  nombreYapellido: string;
  email: string;
  contraseniaActual: string;
}

// Interfaces para restaurantes (desde perspectiva de cliente)
export interface RestauranteResumen {
  id: number;
  usuario: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  calificacion?: number;
}

export interface RestauranteDetail {
  id: number;
  usuario: string;
  nombre: string;
  email: string;
  menu: ProductoResumen[];
  reseniasRestaurante: ReseniaResumen[];
  direcciones: DireccionRestaurante[];
}

export interface DireccionRestaurante {
  id: number;
  calle: string;
  numero: string;
  ciudad: string;
  codigoPostal: string;
  referencia?: string;
}

export interface ProductoResumen {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria?: string;
  disponible?: boolean;
  imagen?: string;
  stock?: number;
}

export interface ReseniaResumen {
  idCliente: number;
  nombreCliente: string;
  resenia: string;
  puntuacion: number;
}

export interface ReseniaCreate {
  restauranteId: number;
  resenia: string;
  puntuacion: number;
}

export interface ReseniaDetail {
  id: number;
  idCliente: number;
  idRestaurante: number;
  resenia: string;
  puntuacion: number;
}

// Interfaces para pedidos (mapeando DTOs del backend)
export interface PedidoCreateDTO {
  restauranteId: number;
  direccionId: number;
  pagoId: number;
  detalles: DetallePedidoDTO[];
}

// Interfaces adicionales para pedidos (nuevas)
export interface PedidoCreate {
  restauranteId: number;
  direccionId: number;
  pagoId: number;
  detalles: DetallePedido[];
}

export interface DetallePedido {
  productoId: number;
  cantidad: number;
}

export interface PedidoDetail {
  id: number;
  restauranteNombre: string;
  estado: string;
  total: number;
  fecha: string;
  detalles: DetallePedido[];
}

export interface DetallePedidoDTO {
  productoId: number;
  nombreProducto?: string;
  precioUnitario?: number;
  cantidad: number;
}

export interface EstadoPedidoDTO {
  estado: string;
}

export interface PedidoResumenDTO {
  id: number;
  fecha: string;
  estado: string;
  total: number;
}

export interface PedidoDetailDTO {
  id: number;
  fecha: string;
  estado: string; // Será el enum del backend
  total: number;
  nombreRestaurante: string;
  idCliente: number;
  detalles: DetallePedidoDTO[];
}

// Interfaces para direcciones
export interface DireccionDTO {
  id: number;
  direccion: string;
  ciudad: string;
  pais: string;
  codigoPostal: string;
}

// Interfaces para métodos de pago
export interface Tarjeta {
  id: number;
  numero: string;
  titular: string;
  vencimiento: string;
  tipo: string;
}

export interface TarjetaRequest {
  tipo: string;
  numero: string; // 16 dígitos
  titular: string;
  vencimiento: string; // MM/YY
  cvv: string; // 3 dígitos
}
