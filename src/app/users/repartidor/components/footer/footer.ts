import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RepartidorEstadoService } from '../../../../core/services/repartidor-estado.service';

@Component({
  selector: 'app-footer-repartidor',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterRepartidor {
  public repartidorEstadoService = inject(RepartidorEstadoService);
}
