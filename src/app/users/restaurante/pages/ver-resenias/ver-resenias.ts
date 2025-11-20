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
        const normalized: ReseniaDTO[] = (raw || []).map((r, idx) => ({
          id: idx,
          clienteNombre: `Cliente ${r.idCliente}`,
          comentario: r.resenia,
          calificacion: r.puntuacion
        }));

        this.resenias.set(normalized);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('No se pudieron cargar las reseñas. Intenta nuevamente.');
        this.isLoading.set(false);
      }
    });
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? 1 : 0);
  }
}
