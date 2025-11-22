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
  backRoute = '/cliente';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Detectar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateButtonState(event.url);
      });
    
    // Estado inicial
    this.updateButtonState(this.router.url);
  }

  private updateButtonState(url: string) {
    this.isLandingPage = url === '/cliente';
    
    // Determinar ruta de vuelta según la página actual
    if (url.includes('/cliente/pedidos') || url.includes('/cliente/historial')) {
      this.backRoute = '/cliente';
    } else if (url.includes('/cliente/perfil')) {
      this.backRoute = '/cliente';
    } else if (url.includes('/cliente/direcciones')) {
      this.backRoute = '/cliente/perfil';
    } else if (url.includes('/cliente/metodos-pago')) {
      this.backRoute = '/cliente/perfil';
    } else if (url.includes('/cliente/restaurante/')) {
      this.backRoute = '/cliente';
    } else {
      this.backRoute = '/cliente';
    }
  }

  goBack() {
    this.router.navigate([this.backRoute]);
  }

  logout() {
    this.authService.logout();
  }
}
