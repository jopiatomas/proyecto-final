import { Routes } from '@angular/router';

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
        path: 'pedidos',
        loadComponent: () =>
          import('./users/cliente/pages/ver-pedidos/ver-pedidos').then((m) => m.VerPedidos),
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
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/restaurante/pages/landing-page/landing-page').then((m) => m.LandingPage),
      },
      {
        path: 'menu',
        loadComponent: () =>
          import('./users/restaurante/pages/gestion-menu/gestion-menu').then((m) => m.GestionMenu),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./users/restaurante/pages/historial-pedidos/historial-pedidos').then(
            (m) => m.HistorialPedidos
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./users/restaurante/pages/ver-perfil/ver-perfil').then((m) => m.VerPerfil),
      },
      {
        path: 'resenias',
        loadComponent: () =>
          import('./users/restaurante/pages/ver-resenias/ver-resenias').then((m) => m.VerResenias),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
