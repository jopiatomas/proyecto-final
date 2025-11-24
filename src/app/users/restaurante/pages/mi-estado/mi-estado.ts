import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestauranteService } from '../../../../core/services/restaurante.service';
import { Header } from '../../../public/components/header-public/header';
import { Footer } from '../../../public/components/footer-public/footer';

interface EstadoRestaurante {
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fechaRegistro?: string;
  fechaAprobacion?: string;
  motivoRechazo?: string;
}

@Component({
  selector: 'app-mi-estado',
  imports: [CommonModule, Header, Footer],
  templateUrl: './mi-estado.html',
  styleUrl: './mi-estado.css',
})
export class MiEstado implements OnInit {
  estado = signal<EstadoRestaurante | null>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');

  constructor(private restauranteService: RestauranteService) {}

  ngOnInit(): void {
    this.cargarEstado();
  }

  cargarEstado(): void {
    this.loading.set(true);
    this.error.set('');

    this.restauranteService.getEstado().subscribe({
      next: (data: any) => {
        // El backend retorna un array, tomamos el primer elemento
        if (data && data.length > 0) {
          this.estado.set(data[0]);
        } else if (data && !Array.isArray(data)) {
          this.estado.set(data);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Error al cargar el estado del restaurante');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  getEstadoClass(): string {
    const est = this.estado();
    if (!est) return '';

    switch (est.estado) {
      case 'APROBADO': return 'estado-aprobado';
      case 'RECHAZADO': return 'estado-rechazado';
      case 'PENDIENTE': return 'estado-pendiente';
      default: return '';
    }
  }

  getEstadoIcon(): string {
    const est = this.estado();
    if (!est) return '⏳';

    switch (est.estado) {
      case 'APROBADO': return '✓';
      case 'RECHAZADO': return '✗';
      case 'PENDIENTE': return '⏳';
      default: return '⏳';
    }
  }

  getEstadoTexto(): string {
    const est = this.estado();
    if (!est) return 'Cargando...';

    switch (est.estado) {
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      case 'PENDIENTE': return 'Pendiente de Aprobación';
      default: return est.estado;
    }
  }

  getEstadoDescripcion(): string {
    const est = this.estado();
    if (!est) return '';

    switch (est.estado) {
      case 'APROBADO':
        return 'Tu restaurante ha sido aprobado y está activo en la plataforma.';
      case 'RECHAZADO':
        return 'Tu solicitud ha sido rechazada por el administrador.';
      case 'PENDIENTE':
        return 'Tu solicitud está siendo revisada por el equipo administrativo.';
      default:
        return '';
    }
  }
}
