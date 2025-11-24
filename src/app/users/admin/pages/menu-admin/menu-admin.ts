import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { AdminClienteService, ClienteDTO, ClienteModificarDTO } from '../../../../core/services/admin-cliente.service';
import { AdminRestauranteService, RestauranteAdminDTO, RestauranteModificarDTO, ReseniaAdminDTO } from '../../../../core/services/admin-restaurante.service';
import { FooterAdmin } from "../../components/footer/footer";
import { RestaurantePendienteDTO, RechazarRestauranteDTO } from '../../../../core/models/app.models';



@Component({
  selector: 'app-menu-admin',
  imports: [Header, CommonModule, FormsModule, FooterAdmin],
  templateUrl: './menu-admin.html',
  styleUrl: './menu-admin.css',
})
export class MenuAdmin implements OnInit {
  @ViewChild(Header) header!: Header;

  activeView = signal<'welcome' | 'clientes' | 'restaurantes' | 'peticiones'>('welcome');

  // Clientes
  clientes = signal<ClienteDTO[]>([]);
  selectedCliente = signal<ClienteDTO | null>(null);
  editingCliente = signal<boolean>(false);
  clienteForm = { usuario: '', nombreYapellido: '' };

  // Restaurantes
  restaurantes = signal<RestauranteAdminDTO[]>([]);
  selectedRestaurante = signal<RestauranteAdminDTO | null>(null);
  editingRestaurante = signal<boolean>(false);
  restauranteForm = { usuario: '', nombre: '' };

  // Reseñas
  resenias = signal<ReseniaAdminDTO[]>([]);
  showResenias = signal<boolean>(false);

  // Pendientes
  restaurantesPendientes = signal<RestaurantePendienteDTO[]>([]);
  selectedPendiente = signal<RestaurantePendienteDTO | null>(null);
  showModalRechazo = signal<boolean>(false);
  motivoRechazo = signal<string>('');
  countPendientes = signal<number>(0);
  // Rechazados
  restaurantesRechazados = signal<RestaurantePendienteDTO[]>([]);
  selectedRechazado = signal<RestaurantePendienteDTO | null>(null);

  // Estado
  loading = signal<boolean>(false);
  error = signal<string>('');
  success = signal<string>('');

  constructor(
    private clienteService: AdminClienteService,
    private restauranteService: AdminRestauranteService
  ) {}

  ngOnInit(): void {
    // Iniciar en vista de bienvenida
    this.cargarContadorPendientes();
  }

  onTabSelected(tab: 'welcome' | 'clientes' | 'restaurantes' | 'peticiones'): void {
    this.activeView.set(tab);
    this.clearSelection();

    if (tab === 'clientes') {
      this.cargarClientes();
    } else if (tab === 'restaurantes') {
      this.cargarRestaurantes();
    } else if (tab === 'peticiones') {
      this.cargarPendientes();
      this.cargarRechazados();
    } else if (tab === 'welcome') {
      // Solo mostrar pantalla inicial
    }
  }

  // ===== CLIENTES =====

  cargarClientes(): void {
    this.loading.set(true);
    this.error.set('');

    this.clienteService.getAllClientes().subscribe({
      next: (data: ClienteDTO[]) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar clientes');
        this.loading.set(false);
      }
    });
  }

  selectCliente(cliente: ClienteDTO): void {
    this.selectedCliente.set(cliente);
    this.editingCliente.set(false);
    this.showResenias.set(false);
  }

  enableEditCliente(): void {
    const cliente = this.selectedCliente();
    if (cliente) {
      this.clienteForm = { usuario: cliente.usuario, nombreYapellido: cliente.nombreYapellido };
      this.editingCliente.set(true);
    }
  }

  guardarCliente(): void {
    const cliente = this.selectedCliente();
    if (!cliente) return;

    const data: ClienteModificarDTO = {
      usuario: this.clienteForm.usuario.trim(),
      nombreYapellido: this.clienteForm.nombreYapellido.trim()
    };

    if (!data.usuario || !data.nombreYapellido) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.clienteService.modificarCliente(cliente.id, data).subscribe({
      next: (clienteActualizado: ClienteDTO) => {
        this.success.set('Cliente actualizado correctamente');
        this.cargarClientes();
        setTimeout(() => {
          const lista = this.clientes();
            const encontrado = lista.find(c => c.usuario === data.usuario);
            if (encontrado) {
              this.selectedCliente.set(encontrado);
            }
          this.editingCliente.set(false);
          this.loading.set(false);
        }, 300);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: () => {
        this.error.set('Error al actualizar cliente');
        this.loading.set(false);
      }
    });
  }

  eliminarCliente(): void {
    const cliente = this.selectedCliente();
    if (!cliente) return;

    if (confirm(`¿Eliminar cliente "${cliente.nombreYapellido}"?`)) {
      this.loading.set(true);
      this.clienteService.eliminarCliente(cliente.id).subscribe({
        next: () => {
          this.success.set('Cliente eliminado');
          this.cargarClientes();
          this.clearSelection();
          this.loading.set(false);
          setTimeout(() => this.success.set(''), 3000);
        },
        error: () => {
          this.error.set('Error al eliminar cliente');
          this.loading.set(false);
        }
      });
    }
  }

  // ===== RESTAURANTES =====

  cargarRestaurantes(): void {
    this.loading.set(true);
    this.error.set('');

    this.restauranteService.getAllRestaurantes().subscribe({
      next: (data: RestauranteAdminDTO[]) => {
        this.restaurantes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar restaurantes');
        this.loading.set(false);
      }
    });
  }

  selectRestaurante(rest: RestauranteAdminDTO): void {
    this.selectedRestaurante.set(rest);
    this.editingRestaurante.set(false);
    this.showResenias.set(false);
  }

  enableEditRestaurante(): void {
    const rest = this.selectedRestaurante();
    if (rest) {
      this.restauranteForm = { usuario: rest.usuario, nombre: rest.nombre };
      this.editingRestaurante.set(true);
    }
  }

  guardarRestaurante(): void {
    const rest = this.selectedRestaurante();
    if (!rest) return;

    const data: RestauranteModificarDTO = {
      usuario: this.restauranteForm.usuario.trim(),
      nombreRestaurante: this.restauranteForm.nombre.trim()
    };

    if (!data.usuario || !data.nombreRestaurante) {
      this.error.set('Completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.restauranteService.modificarRestaurante(rest.usuario, data).subscribe({
      next: (mensaje: string) => {
        this.success.set(mensaje || 'Restaurante actualizado correctamente');
        this.cargarRestaurantes();
        setTimeout(() => {
          const lista = this.restaurantes();
          const encontrado = lista.find(r => r.usuario === data.usuario);
          if (encontrado) {
            this.selectedRestaurante.set(encontrado);
          }
          this.editingRestaurante.set(false);
          this.loading.set(false);
        }, 300);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: () => {
        this.error.set('Error al actualizar restaurante');
        this.loading.set(false);
      }
    });
  }

  eliminarRestaurante(): void {
    const rest = this.selectedRestaurante();
    if (!rest) return;

    if (confirm(`¿Eliminar restaurante "${rest.nombre}"?`)) {
      this.loading.set(true);
      this.restauranteService.eliminarRestaurante(rest.id).subscribe({
        next: () => {
          this.success.set('Restaurante eliminado');
          this.cargarRestaurantes();
          this.clearSelection();
          this.loading.set(false);
          setTimeout(() => this.success.set(''), 3000);
        },
        error: () => {
          this.error.set('Error al eliminar restaurante');
          this.loading.set(false);
        }
      });
    }
  }

  // ===== RESEÑAS =====

  verResenias(): void {
    const rest = this.selectedRestaurante();
    if (!rest) return;

    this.loading.set(true);
    this.showResenias.set(true);
    this.error.set('');

    this.restauranteService.getReseniasRestaurante(rest.id).subscribe({
      next: (data: ReseniaAdminDTO[]) => {
        this.resenias.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar reseñas');
        this.loading.set(false);
      }
    });
  }

  eliminarResenia(resenia: ReseniaAdminDTO): void {
    const rest = this.selectedRestaurante();
    if (!rest) return; // mantenemos esta verificación si la UI necesita un restaurante seleccionado

    if (confirm('¿Eliminar esta reseña?')) {
      this.loading.set(true);
      this.restauranteService.eliminarResenia(resenia.id).subscribe({
        next: () => {
          this.success.set('Reseña eliminada');
          this.verResenias();
          setTimeout(() => this.success.set(''), 3000);
        },
        error: () => {
          this.error.set('Error al eliminar reseña');
          this.loading.set(false);
        }
      });
    }
  }

  // ===== PENDIENTES =====

  cargarContadorPendientes(): void {
    this.restauranteService.countPendientes().subscribe({
      next: (count: number) => {
        this.countPendientes.set(count);
      },
      error: () => {
        // Silencioso, el contador simplemente no se muestra
      }
    });
  }

  cargarPendientes(): void {
    this.loading.set(true);
    this.error.set('');

    this.restauranteService.getPendientes().subscribe({
      next: (data: RestaurantePendienteDTO[]) => {
        this.restaurantesPendientes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar restaurantes pendientes');
        this.loading.set(false);
      }
    });
  }

  selectPendiente(pendiente: RestaurantePendienteDTO): void {
    this.selectedPendiente.set(pendiente);
    this.selectedRechazado.set(null);
  }

  cargarRechazados(): void {
    this.loading.set(true);
    this.error.set('');

    this.restauranteService.getRechazados().subscribe({
      next: (data: RestaurantePendienteDTO[]) => {
        this.restaurantesRechazados.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar restaurantes rechazados');
        this.loading.set(false);
      }
    });
  }

  selectRechazado(item: RestaurantePendienteDTO): void {
    this.selectedRechazado.set(item);
    this.selectedPendiente.set(null);
  }

  aprobarRestaurante(): void {
    const pendiente = this.selectedPendiente();
    if (!pendiente) return;

    if (confirm(`¿Aprobar restaurante "${pendiente.nombre}"?`)) {
      this.loading.set(true);
      this.restauranteService.aprobarRestaurante(pendiente.id).subscribe({
        next: (mensaje: string) => {
          this.success.set(mensaje || 'Restaurante aprobado correctamente');
          this.cargarPendientes();
          this.cargarRechazados();
          this.cargarContadorPendientes();
          this.selectedPendiente.set(null);
          this.loading.set(false);
          setTimeout(() => this.success.set(''), 3000);
        },
        error: () => {
          this.error.set('Error al aprobar restaurante');
          this.loading.set(false);
        }
      });
    }
  }

  abrirModalRechazo(): void {
    this.motivoRechazo.set('');
    this.showModalRechazo.set(true);
  }

  cerrarModalRechazo(): void {
    this.showModalRechazo.set(false);
    this.motivoRechazo.set('');
  }

  confirmarRechazo(): void {
    const pendiente = this.selectedPendiente();
    const motivo = this.motivoRechazo().trim();

    if (!pendiente) return;

    if (!motivo) {
      this.error.set('Debes especificar un motivo de rechazo');
      return;
    }

    const data: RechazarRestauranteDTO = { motivoRechazo: motivo };

    this.loading.set(true);
    this.showModalRechazo.set(false);

    this.restauranteService.rechazarRestaurante(pendiente.id, data).subscribe({
      next: (mensaje: string) => {
        this.success.set(mensaje || 'Restaurante rechazado');
        this.cargarPendientes();
        this.cargarRechazados();
        this.cargarContadorPendientes();
        this.selectedPendiente.set(null);
        this.motivoRechazo.set('');
        this.loading.set(false);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: () => {
        this.error.set('Error al rechazar restaurante');
        this.loading.set(false);
      }
    });
  }

  // ===== UTILIDADES =====

  clearSelection(): void {
    this.selectedCliente.set(null);
    this.selectedRestaurante.set(null);
    this.selectedPendiente.set(null);
    this.selectedRechazado.set(null);
    this.editingCliente.set(false);
    this.editingRestaurante.set(false);
    this.showResenias.set(false);
    this.resenias.set([]);
    this.error.set('');
    this.success.set('');
  }

  cancelEdit(): void {
    this.editingCliente.set(false);
    this.editingRestaurante.set(false);
    this.error.set('');
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 1 : 0);
  }
}
