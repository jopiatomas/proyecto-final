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
<<<<<<< HEAD
export class Header implements OnInit {
  esPaginaPrincipal = false;
  rutaRetorno = '/restaurante';
=======
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  dropdownOpen = signal<boolean>(false);
  confirmandoCerrarSesion = false;
>>>>>>> Tomas

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

<<<<<<< HEAD
  volver() {
    this.router.navigate([this.rutaRetorno]);
  }

  cerrarSesion() {
=======
  cerrarSesion(): void {
    this.dropdownOpen.set(false);
    this.confirmandoCerrarSesion = true;
  }

  confirmarCerrarSesion(): void {
>>>>>>> Tomas
    this.authService.logout();
  }

  cancelarCerrarSesion(): void {
    this.confirmandoCerrarSesion = false;
  }
}
