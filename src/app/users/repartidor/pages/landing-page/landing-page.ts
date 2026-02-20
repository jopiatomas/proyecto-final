import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RepartidorService } from '../../../../core/services/repartidor.service';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, Header, FooterRepartidor],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit, OnDestroy {
  private repartidorService = inject(RepartidorService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  perfil = signal<any>(null);
  disponible = signal(false);
  loading = signal(false);
  cambiandoDisponibilidad = signal(false);
  mostrarConfirmacionActivar = signal(false);
  activando = signal(false);
  pedidoActual = signal<any>(null);
  errorMessage = signal('');

  ngOnInit() {
    this.cargarPerfil();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPerfil() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.repartidorService
      .obtenerPerfil()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.disponible.set(perfil?.disponible || false);
          this.cargarPedidoActual();
        },
        error: (err) => {
          this.errorMessage.set('Error al cargar el perfil');
          this.loading.set(false);
        },
      });
  }

  cargarPedidoActual() {
    this.repartidorService
      .obtenerPedidoActual()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pedido) => {
          const pedidoMapeado = {
            ...pedido,
            direccionEntrega: pedido.direccionEntrega || pedido.clienteDireccion || pedido.direccion || 'No especificada',
            restauranteDireccion: pedido.restauranteDireccion || pedido.direccionRestaurante || 'No especificada'
          };
          
          this.pedidoActual.set(pedidoMapeado);
          this.loading.set(false);
        },
        error: (err) => {
          this.pedidoActual.set(null);
          this.loading.set(false);
        },
      });
  }

  toggleDisponibilidad() {
    this.cambiandoDisponibilidad.set(true);
    this.errorMessage.set('');
    const nuevoEstado = !this.disponible();

    this.repartidorService
      .cambiarDisponibilidad(nuevoEstado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.disponible.set(nuevoEstado);
          this.cambiandoDisponibilidad.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            'Error: ' + (err.error?.error || 'No se pudo cambiar la disponibilidad'),
          );
          this.cambiandoDisponibilidad.set(false);
        },
      });
  }

  desactivar() {
    this.cambiandoDisponibilidad.set(true);
    this.errorMessage.set('');

    this.repartidorService
      .desactivarDisponibilidad()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.disponible.set(false);
          this.cambiandoDisponibilidad.set(false);
        },
        error: (err) => {
          this.errorMessage.set('Error: ' + (err.error?.error || 'No se pudo desactivar'));
          this.cambiandoDisponibilidad.set(false);
        },
      });
  }

  activarCuenta() {
    this.mostrarConfirmacionActivar.set(true);
  }

  cancelarActivacion() {
    this.mostrarConfirmacionActivar.set(false);
  }

  confirmarActivacion() {
    this.activando.set(true);
    this.errorMessage.set('');

    this.repartidorService
      .activarCuenta()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.activando.set(false);
          this.mostrarConfirmacionActivar.set(false);
          this.cargarPerfil();
        },
        error: (err: any) => {
          this.errorMessage.set('Error: ' + (err.error?.error || 'No se pudo activar la cuenta'));
          this.activando.set(false);
        },
      });
  }

  irAPedidoActual() {
    this.router.navigate(['/repartidor/ver-pedido-actual']);
  }

  irAPedidosDisponibles() {
    this.router.navigate(['/repartidor/pedidos-disponibles']);
  }

  irAlHistorial() {
    this.router.navigate(['/repartidor/historial-entregas']);
  }

  irAlPerfil() {
    this.router.navigate(['/repartidor/perfil']);
  }
}
