import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { restauranteAprobadoGuard } from './core/guards/restaurante-aprobado.guard';
import { clienteGuard } from './core/guards/cliente.guard';
import { restauranteGuard } from './core/guards/restaurante.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./users/public/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./users/public/pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'cliente',
    canActivate: [clienteGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/cliente/pages/landing-page/landing-page').then((m) => m.LandingPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./users/cliente/pages/perfil/perfil').then((m) => m.Perfil),
      },
      {
        path: 'direcciones',
        loadComponent: () =>
          import('./users/cliente/pages/direcciones/direcciones').then((m) => m.Direcciones),
      },
      {
        path: 'metodos-pago',
        loadComponent: () =>
          import('./users/cliente/pages/metodos-pago/metodos-pago').then((m) => m.MetodosPago),
      },
      {
        path: 'restaurante/:nombre',
        loadComponent: () =>
          import('./users/cliente/pages/ver-restaurante/ver-restaurante').then(
            (m) => m.VerRestaurante
          ),
      },
      {
        path: 'resenia',
        loadComponent: () =>
          import('./users/cliente/pages/realizar-resenia/realizar-resenia').then(
            (m) => m.RealizarResenia
          ),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./users/cliente/pages/ver-historial-pedidos/ver-historial-pedidos').then((m) => m.VerHistorialPedidos),
      },
    ],
  },
  {
    path: 'restaurante',
    canActivate: [restauranteGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/restaurante/pages/landing-page/landing-page').then((m) => m.LandingPage),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./users/restaurante/pages/gestion-menu/gestion-menu').then((m) => m.GestionMenu),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./users/restaurante/pages/historial-pedidos/historial-pedidos').then(
            (m) => m.HistorialPedidos
          ),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./users/restaurante/pages/ver-perfil/perfil').then((m) => m.Perfil),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'direcciones',
        loadComponent: () =>
          import('./users/restaurante/pages/direcciones/direcciones').then((m) => m.Direcciones),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'balance',
        loadComponent: () =>
          import('./users/restaurante/pages/balance/balance').then((m) => m.Balance),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'resenias',
        loadComponent: () =>
          import('./users/restaurante/pages/ver-resenias/ver-resenias').then((m) => m.VerResenias),
        canActivate: [restauranteAprobadoGuard],
      },
      {
        path: 'mi-estado',
        loadComponent: () =>
          import('./users/restaurante/pages/mi-estado/mi-estado').then((m) => m.MiEstado),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/admin/pages/menu-admin/menu-admin').then((m) => m.MenuAdmin),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
