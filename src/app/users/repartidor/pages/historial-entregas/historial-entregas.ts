import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRepartidor } from '../../components/footer/footer';
import { RepartidorService } from '../../../../core/services/repartidor.service';

@Component({
  selector: 'app-historial-entregas',
  imports: [Header, FooterRepartidor, CommonModule],
  templateUrl: './historial-entregas.html',
  styleUrl: './historial-entregas.css',
})
export class HistorialEntregas implements OnInit {
  private repartidorService = inject(RepartidorService);
  private router = inject(Router);

  historial = signal<any[]>([]);
  loading = signal(false);
  filtroEstado = signal<string>('');
  historialFiltrado = signal<any[]>([]);

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.loading.set(true);
    this.repartidorService.obtenerHistorialEntregas().subscribe({
      next: (entregas) => {
        this.historial.set(entregas);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: (error) => {
        this.historial.set([]);
        this.loading.set(false);
      },
    });
  }

  aplicarFiltros() {
    let resultado = this.historial();

    if (this.filtroEstado()) {
      resultado = resultado.filter((p) =>
        p.estado.toLowerCase().includes(this.filtroEstado().toLowerCase()),
      );
    }

    // Ordenar por fecha descendente
    resultado = resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.fechaEntrega || a.createdAt || a.fechaPedido).getTime();
      const fechaB = new Date(b.fecha || b.fechaEntrega || b.createdAt || b.fechaPedido).getTime();
      return fechaB - fechaA;
    });

    this.historialFiltrado.set(resultado);
  }

  cambiarFiltro(estado: string) {
    this.filtroEstado.set(estado === this.filtroEstado() ? '' : estado);
    this.aplicarFiltros();
  }

  volverAlPanel() {
    this.router.navigate(['/repartidor']);
  }

  calcularMontoTotal(): number {
    return this.historialFiltrado().reduce((sum, e) => sum + e.total, 0);
  }

  calcularPromedioPorEntrega(): number {
    const total = this.calcularMontoTotal();
    const cantidad = this.historialFiltrado().length || 1;
    return total / cantidad;
  }
}
