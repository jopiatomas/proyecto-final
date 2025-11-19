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
