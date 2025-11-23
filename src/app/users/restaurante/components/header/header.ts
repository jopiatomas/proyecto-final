import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  esPaginaPrincipal = false;
  rutaRetorno = '/restaurante';

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe((evento: NavigationEnd) => {
        this.actualizarEstadoBoton(evento.url);
      });
    
    this.actualizarEstadoBoton(this.router.url);
  }

  private actualizarEstadoBoton(url: string) {
    this.esPaginaPrincipal = url === '/restaurante';
    
    if (url.includes('/restaurante/menu') || url.includes('/restaurante/historial') || url.includes('/restaurante/resenias')) {
      this.rutaRetorno = '/restaurante';
    } else if (url.includes('/restaurante/perfil')) {
      this.rutaRetorno = '/restaurante';
    } else if (url.includes('/restaurante/direcciones')) {
      this.rutaRetorno = '/restaurante/perfil';
    } else if (url.includes('/restaurante/balance')) {
      this.rutaRetorno = '/restaurante/perfil';
    } else {
      this.rutaRetorno = '/restaurante';
    }
  }

  volver() {
    this.router.navigate([this.rutaRetorno]);
  }

  cerrarSesion() {
    this.authService.logout();
  }
}