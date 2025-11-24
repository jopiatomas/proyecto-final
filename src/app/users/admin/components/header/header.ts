import { Component, signal, HostListener, inject, Output, EventEmitter } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  dropdownOpen = signal<boolean>(false);
  activeTab = signal<'welcome' | 'clientes' | 'restaurantes' | 'peticiones' | null>(null);
  countPendientes = signal<number>(0);

  @Output() tabSelected = new EventEmitter<'welcome' | 'clientes' | 'restaurantes' | 'peticiones'>();

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  selectTab(tab: 'welcome' | 'clientes' | 'restaurantes' | 'peticiones'): void {
    this.activeTab.set(tab);
    this.tabSelected.emit(tab);
  }

  setCountPendientes(count: number): void {
    this.countPendientes.set(count);
  }

  goHome(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.selectTab('welcome');
    this.router.navigate(['/admin']);
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
