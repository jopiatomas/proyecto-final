import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RestauranteService } from '../services/restaurante.service';
import { map, catchError, of } from 'rxjs';

export const restauranteAprobadoGuard: CanActivateFn = (route, state) => {
  const restauranteService = inject(RestauranteService);
  const router = inject(Router);

  return restauranteService.getEstado().pipe(
    map((data: any) => {
      let estado = null;

      // Manejar tanto arrays como objetos
      if (data && data.length > 0) {
        estado = data[0];
      } else if (data && !Array.isArray(data)) {
        estado = data;
      }

      // Si no está aprobado, redirigir a mi-estado
      if (estado && estado.estado !== 'APROBADO') {
        router.navigate(['/restaurante/mi-estado']);
        return false;
      }

      return true;
    }),
    catchError((error) => {
      // En caso de error, permitir acceso (o cambiar a false según preferencia)
      console.error('Error verificando estado del restaurante:', error);
      return of(true);
    })
  );
};
