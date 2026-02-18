import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RepartidorEstadoService {
  // Signal para compartir el estado de activo entre componentes
  activo = signal<boolean>(true);

  setActivo(activo: boolean) {
    this.activo.set(activo);
  }

  getActivo(): boolean {
    return this.activo();
  }
}
