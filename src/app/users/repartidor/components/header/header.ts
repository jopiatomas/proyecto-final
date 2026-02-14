import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLandingPage = false;
  backRoute = '/repartidor';
  confirmandoCerrarSesion = false;

  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit() {
    // Detectar cambios de ruta
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateButtonState(event.url);
      });

    // Estado inicial
    this.updateButtonState(this.router.url);
  }

  private updateButtonState(url: string) {
    this.isLandingPage = url === '/repartidor';

    // Determinar ruta de vuelta según la página actual
    if (url.includes('/repartidor/pedidos-disponibles')) {
      this.backRoute = '/repartidor';
    } else if (url.includes('/repartidor/ver-pedido-actual')) {
      this.backRoute = '/repartidor';
    } else if (url.includes('/repartidor/perfil')) {
      this.backRoute = '/repartidor';
    } else if (url.includes('/repartidor/historial-entregas')) {
      this.backRoute = '/repartidor';
    } else {
      this.backRoute = '/repartidor';
    }
  }

  goBack() {
    this.router.navigate([this.backRoute]);
  }

  logout() {
    this.confirmandoCerrarSesion = true;
  }

  confirmarCerrarSesion() {
    this.authService.logout();
  }

  cancelarCerrarSesion() {
    this.confirmandoCerrarSesion = false;
  }
}
