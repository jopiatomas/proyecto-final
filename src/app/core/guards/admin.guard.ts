import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar si tiene el rol de ADMIN
  const role = authService.getUserRole();
  if (role !== 'ADMIN') {
    // Redirigir según su rol
    if (role === 'CLIENTE') {
      router.navigate(['/cliente']);
    } else if (role === 'RESTAURANTE') {
      router.navigate(['/restaurante']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
