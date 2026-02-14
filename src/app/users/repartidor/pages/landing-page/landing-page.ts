import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { RepartidorService, RepartidorDetailDTO, PedidoRepartidorDTO } from '../../../../core/services/repartidor.service';

@Component({
  selector: 'app-landing-page',
  imports: [Header, FooterRepartidor, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  private repartidorService = inject(RepartidorService);
  private router = inject(Router);

  perfil = signal<RepartidorDetailDTO | null>(null);
  pedidoActual = signal<PedidoRepartidorDTO | null>(null);
  loading = signal(false);
  disponible = signal(false);
  cambandoDisponibilidad = signal(false);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    
    this.repartidorService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil.set(perfil);
        this.disponible.set(perfil.disponible);
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
}
