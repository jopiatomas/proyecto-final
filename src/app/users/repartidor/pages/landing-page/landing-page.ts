import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { RepartidorService, RepartidorDetailDTO, PedidoRepartidorDTO } from '../../../../core/services/repartidor.service';
import { RepartidorEstadoService } from '../../../../core/services/repartidor-estado.service';

@Component({
  selector: 'app-landing-page',
  imports: [Header, FooterRepartidor, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  private repartidorService = inject(RepartidorService);
  private repartidorEstadoService = inject(RepartidorEstadoService);
  private router = inject(Router);

  perfil = signal<RepartidorDetailDTO | null>(null);
  pedidoActual = signal<PedidoRepartidorDTO | null>(null);
  loading = signal(false);
  disponible = signal(false);
  cambandoDisponibilidad = signal(false);
  activando = signal(false);
  mostrarConfirmacionActivar = signal(false);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    
    this.repartidorService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.disponible.set(perfil.disponible);
        this.repartidorEstadoService.setActivo(perfil.activo);
        this.cargarPedidoActual();
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.loading.set(false);
      }
    });
  }

  cargarPedidoActual() {
    this.repartidorService.obtenerPedidoActual().subscribe({
      next: (pedido) => {
        this.pedidoActual.set(pedido);
        this.loading.set(false);
      },
      error: (error) => {
        // No hay pedido actual
        this.pedidoActual.set(null);
        this.loading.set(false);
      }
    });
  }

  toggleDisponibilidad() {
    this.cambandoDisponibilidad.set(true);
    const nuevoEstado = !this.disponible();

    this.repartidorService.cambiarDisponibilidad(nuevoEstado).subscribe({
      next: () => {
        this.disponible.set(nuevoEstado);
        this.cambandoDisponibilidad.set(false);
      },
      error: (error) => {
        console.error('Error al cambiar disponibilidad:', error);
        this.cambandoDisponibilidad.set(false);
      }
    });
  }

  irAPedidosDisponibles() {
    this.router.navigate(['/repartidor/pedidos-disponibles']);
  }

  irAPedidoActual() {
    this.router.navigate(['/repartidor/ver-pedido-actual']);
  }

  irAlHistorial() {
    this.router.navigate(['/repartidor/historial-entregas']);
  }

  irAlPerfil() {
    this.router.navigate(['/repartidor/perfil']);
  }

  activarCuenta() {
    this.mostrarConfirmacionActivar.set(true);
  }

  confirmarActivacion() {
    this.mostrarConfirmacionActivar.set(false);
    this.activando.set(true);

    this.repartidorService.activarCuenta().subscribe({
      next: () => {
        // Después de activar la cuenta, cambiar disponibilidad a true
        this.repartidorService.cambiarDisponibilidad(true).subscribe({
          next: () => {
            // Actualizar el perfil local
            const perfilActual = this.perfil();
            if (perfilActual) {
              this.perfil.set({ ...perfilActual, activo: true, trabajando: true, disponible: true });
            }
            this.disponible.set(true);
            this.repartidorEstadoService.setActivo(true);
            this.activando.set(false);
          },
          error: (error) => {
            console.error('Error al cambiar disponibilidad después de activar:', error);
            // Aunque falló cambiar disponibilidad, la cuenta está activa
            const perfilActual = this.perfil();
            if (perfilActual) {
              this.perfil.set({ ...perfilActual, activo: true });
            }
            this.repartidorEstadoService.setActivo(true);
            this.activando.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error al activar cuenta:', error);
        this.activando.set(false);
        alert('Error al activar la cuenta. Intenta nuevamente.');
      }
    });
  }

  cancelarActivacion() {
    this.mostrarConfirmacionActivar.set(false);
  }
}
