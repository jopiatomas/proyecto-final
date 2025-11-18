import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ReseniaService, ReseniaDTO, ReseniaBackendDTO } from '../../../../core/services/resenia.service';

@Component({
  selector: 'app-ver-resenias',
  imports: [Header, Footer, CommonModule],
  templateUrl: './ver-resenias.html',
  styleUrl: './ver-resenias.css',
})
export class VerResenias implements OnInit {
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  resenias = signal<ReseniaDTO[]>([]);

  constructor(private reseniaService: ReseniaService) {}

  ngOnInit(): void {
    this.cargarResenias();
  }

  cargarResenias(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reseniaService.getResenias().subscribe({
      next: (raw: ReseniaBackendDTO[]) => {
        // Debug: payload crudo desde backend
        console.log('[Reseñas][raw] Cantidad recibida:', raw?.length ?? 0);
        console.table(raw, ['idCliente', 'resenia', 'puntuacion', 'fecha']);

        // Normalizar datos a la forma usada por la UI
        const normalized: ReseniaDTO[] = (raw || []).map((r, idx) => ({
          id: idx,
          clienteNombre: r.clienteNombre ?? (r.idCliente != null ? `Cliente ${r.idCliente}` : 'Cliente'),
          comentario: r.resenia ?? '',
          calificacion: r.puntuacion ?? 0,
          fecha: r.fecha
        }));

        // Debug: datos normalizados
        console.table(normalized, ['id', 'clienteNombre', 'comentario', 'calificacion', 'fecha']);

        // Ordenar por fecha si existe, sino mantener orden original
        const sorted = [...normalized].sort((a, b) => {
          const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
          const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
          return tb - ta;
        });
        this.resenias.set(sorted);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.errorMessage.set('No se pudieron cargar las reseñas. Intenta nuevamente.');
        console.error('Error cargando reseñas', err);
        this.isLoading.set(false);
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 1 : 0);
  }
}
