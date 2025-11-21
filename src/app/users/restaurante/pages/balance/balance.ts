import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RestauranteService } from '../../../../services/restaurante.service';

interface BalanceData {
  totalRecaudado: number;
  cantidadPedidos: number;
  promedioVenta: number;
}

@Component({
  selector: 'app-balance',
  imports: [Header, Footer, CommonModule, FormsModule],
  templateUrl: './balance.html',
  styleUrl: './balance.css',
})
export class Balance implements OnInit {
  private restauranteService = inject(RestauranteService);
  
  balance = signal<BalanceData>({
    totalRecaudado: 0,
    cantidadPedidos: 0,
    promedioVenta: 0
  });
  
  filtroTipo: 'dia' | 'mes' = 'dia';
  fechaSeleccionada: string = '';
  mesSeleccionado: string = '';
  loading = signal(false);

  ngOnInit() {
    const hoy = new Date();
    this.fechaSeleccionada = hoy.toISOString().split('T')[0];
    this.mesSeleccionado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    this.cargarBalance();
  }

  cargarBalance() {
    this.loading.set(true);
    
    const filtroDTO = {
      tipoFiltro: this.filtroTipo,
      fecha: this.filtroTipo === 'dia' ? this.fechaSeleccionada : null,
      mes: this.filtroTipo === 'mes' ? this.mesSeleccionado : null
    };
    
    
    this.restauranteService.getBalance(filtroDTO).subscribe({
      next: (response) => {
        const balanceData: BalanceData = {
          totalRecaudado: response.totalRecaudado || 0,
          cantidadPedidos: response.cantidadPedidos || 0,
          promedioVenta: response.promedioVenta || 0
        };
        this.balance.set(balanceData);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
      }
    });
  }

  onFiltroChange() {
    this.cargarBalance();
  }

  onFechaChange() {
    if (this.filtroTipo === 'dia') {
      this.cargarBalance();
    }
  }

  onMesChange() {
    if (this.filtroTipo === 'mes') {
      this.cargarBalance();
    }
  }
}
