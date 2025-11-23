import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🔐 Interceptor - Token:', token ? 'Existe' : 'No existe');
  console.log('🔐 Interceptor - URL:', req.url);
  console.log('🔐 Interceptor - Token completo:', token);

  if (token) {
    console.log('✅ Agregando token a la petición');
    console.log('✅ Authorization header:', `Bearer ${token}`);
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  console.log('⚠️ No hay token, petición sin autenticación');
  return next(req);
};
