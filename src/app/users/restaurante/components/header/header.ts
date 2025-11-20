import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  dropdownOpen = signal<boolean>(false);

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.perfil-container')) {
      this.dropdownOpen.set(false);
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}