import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import { RestauranteService } from '../../../../core/services/restaurante.service';

interface DatosBalance {
  totalRecaudado: number;
  cantidadPedidos: number;
  promedioVenta: number;
}

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [Header, FooterRestaurante, CommonModule, FormsModule],
  templateUrl: './balance.html',
  styleUrl: './balance.css',
})
export class Balance implements OnInit {
  private restauranteService = inject(RestauranteService);
  
  balance = signal<DatosBalance>({
    totalRecaudado: 0,
    cantidadPedidos: 0,
    promedioVenta: 0
  });
  
  filtroTipo: 'dia' | 'mes' = 'dia';
  fechaSeleccionada: string = '';
  mesSeleccionado: string = '';
  cargando = signal(false);

  ngOnInit() {
    const hoy = new Date();
    this.fechaSeleccionada = hoy.toISOString().split('T')[0];
    this.mesSeleccionado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    this.cargarBalance();
  }

  cargarBalance() {
    this.cargando.set(true);
    
    // El filtro incluye tipo de filtro (día/mes) y la fecha correspondiente
    // IMPORTANTE: El backend debe calcular el balance SOLO con pedidos en estado "ENTREGADO"
    // para reflejar las ganancias reales del restaurante (pedidos completados sin problemas)
    const filtroDTO = {
      tipoFiltro: this.filtroTipo,
      fecha: this.filtroTipo === 'dia' ? this.fechaSeleccionada : null,
      mes: this.filtroTipo === 'mes' ? this.mesSeleccionado : null
    };
    
    
    this.restauranteService.getBalance(filtroDTO).subscribe({
      next: (respuesta) => {
        const datosBalance: DatosBalance = {
          totalRecaudado: respuesta.totalRecaudado || 0,
          cantidadPedidos: respuesta.cantidadPedidos || 0,
          promedioVenta: respuesta.promedioVenta || 0
        };
        this.balance.set(datosBalance);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
      }
    });
  }

  alCambiarFiltro() {
    this.cargarBalance();
  }

  alCambiarFecha() {
    if (this.filtroTipo === 'dia') {
      this.cargarBalance();
    }
  }

  alCambiarMes() {
    if (this.filtroTipo === 'mes') {
      this.cargarBalance();
    }
  }
}
