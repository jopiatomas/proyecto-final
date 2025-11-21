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
}

export interface ReseniaResumen {
  id: number;
  calificacion: number;
  comentario?: string;
  fecha: string;
  nombreCliente?: string;
}

export interface ReseniaCreate {
  restauranteId: number;
  calificacion: number;
  comentario?: string;
}

export interface ReseniaDetail {
  id: number;
  calificacion: number;
  comentario?: string;
  fecha: string;
  nombreCliente: string;
  restauranteNombre: string;
}

// Interfaces para pedidos (mapeando DTOs del backend)
export interface PedidoCreateDTO {
  restauranteId: number;
  direccionId: number;
  pagoId: number;
  detalles: DetallePedidoDTO[];
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
  calle: string;
  numero: string;
  ciudad: string;
  codigoPostal: string;
  referencia?: string;
}

// Interfaces para métodos de pago
export interface Tarjeta {
  id: number;
  numeroTarjeta: string;
  titular: string;
  fechaVencimiento: string;
  tipo: string;
}