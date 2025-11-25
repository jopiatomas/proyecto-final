import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getUserRole();
  if (role !== 'ADMIN') {
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
