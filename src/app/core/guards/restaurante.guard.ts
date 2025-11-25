import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const restauranteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getUserRole();
  if (role !== 'RESTAURANTE') {
    if (role === 'CLIENTE') {
      router.navigate(['/cliente']);
    } else if (role === 'ADMIN') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
