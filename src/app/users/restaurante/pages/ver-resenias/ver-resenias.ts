import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import {
  ReseniaService,
  ReseniaDTO,
  ReseniaBackendDTO,
} from '../../../../core/services/resenia.service';
import {
  ReseniaService,
  ReseniaDTO,
  ReseniaBackendDTO,
} from '../../../../core/services/resenia.service';

@Component({
  selector: 'app-ver-resenias',
  standalone: true,
  imports: [Header, FooterRestaurante, CommonModule],
  templateUrl: './ver-resenias.html',
  styleUrl: './ver-resenias.css',
})
export class VerResenias implements OnInit {
  estaCargando = signal<boolean>(false);
  mensajeError = signal<string>('');
  resenias = signal<ReseniaDTO[]>([]);

  constructor(private reseniaService: ReseniaService) {}

  ngOnInit(): void {
    this.cargarResenias();
  }

  cargarResenias(): void {
    this.estaCargando.set(true);
    this.mensajeError.set('');

    this.reseniaService.getResenias().subscribe({
      next: (datos: ReseniaBackendDTO[]) => {
        const normalizadas: ReseniaDTO[] = (datos || []).map((r, idx) => ({
          id: idx,
          clienteNombre: r.nombreCliente || `Cliente #${r.idCliente}`,
          comentario: r.resenia,
          calificacion: r.puntuacion,
        }));

        this.resenias.set(normalizadas);
        this.estaCargando.set(false);
      },
      error: (err) => {
        this.mensajeError.set('No se pudieron cargar las reseñas. Intenta nuevamente.');
        this.estaCargando.set(false);
      },
    });
  }

  obtenerArregloEstrellas(calificacion: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < Math.round(calificacion) ? 1 : 0));
  }
}
