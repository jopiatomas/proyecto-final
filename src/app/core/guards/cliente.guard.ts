import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar si tiene el rol de CLIENTE
  const role = authService.getUserRole();
  if (role !== 'CLIENTE') {
    // Redirigir según su rol
    if (role === 'RESTAURANTE') {
      router.navigate(['/restaurante']);
    } else if (role === 'ADMIN') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
