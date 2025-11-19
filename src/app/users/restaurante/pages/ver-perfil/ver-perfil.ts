import { Component, OnInit, signal } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { RestauranteService, RestauranteDetailDTO, RestauranteModificarDTO } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-perfil',
  imports: [Header, Footer, CommonModule, FormsModule],
  templateUrl: './ver-perfil.html',
  styleUrl: './ver-perfil.css',
})
export class VerPerfil implements OnInit {
  profile = signal<RestauranteDetailDTO | null>(null);
  isEditing = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  role = signal<string>('RESTAURANTE');

  // Formulario de edición
  editForm = {
    usuario: '',
    nombre: ''
  };

  // Formulario de cambio de contraseña
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  showPasswordChange = signal<boolean>(false);

  constructor(
    private restauranteService: RestauranteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // establecer rol desde el token si está disponible
    const current = this.authService.currentUser();
    if (current?.rol) {
      this.role.set(current.rol);
    }
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.restauranteService.getPerfil().subscribe({
      next: (data: RestauranteDetailDTO) => {
        this.profile.set(data);
        this.isLoading.set(false);
        // Inicializar formulario con datos actuales
        this.editForm = {
          usuario: data.usuario,
          nombre: data.nombre
        };
      },
      error: (error: any) => {
        this.errorMessage.set('Error al cargar el perfil. Por favor, intenta nuevamente.');
        this.isLoading.set(false);
        console.error('Error loading profile:', error);
      }
    });
  }

  enableEdit(): void {
    this.isEditing.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    // Restaurar valores originales
    const currentProfile = this.profile();
    if (currentProfile) {
      this.editForm = {
        usuario: currentProfile.usuario,
        nombre: currentProfile.nombre
      };
    }
    this.errorMessage.set('');
  }

  saveProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const updateData: RestauranteModificarDTO = {
      usuario: this.editForm.usuario,
      nombre: this.editForm.nombre
    };

    this.restauranteService.modificarPerfil(updateData).subscribe({
      next: (message: string) => {
        // Recargar el perfil después de actualizar
        this.loadProfile();
        this.isEditing.set(false);
        this.successMessage.set(message);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set('Error al actualizar el perfil. Por favor, verifica los datos.');
        this.isLoading.set(false);
        console.error('Error updating profile:', error);
      }
    });
  }

  togglePasswordChange(): void {
    this.showPasswordChange.set(!this.showPasswordChange());
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.errorMessage.set('');
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const passwordData: RestauranteModificarDTO = {
      contraseniaActual: this.passwordForm.currentPassword,
      contraseniaNueva: this.passwordForm.newPassword
    };

    this.restauranteService.cambiarContrasenia(passwordData).subscribe({
      next: (message: string) => {
        this.successMessage.set(message);
        this.showPasswordChange.set(false);
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.isLoading.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.errorMessage.set('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
        this.isLoading.set(false);
        console.error('Error changing password:', error);
      }
    });
  }
}
