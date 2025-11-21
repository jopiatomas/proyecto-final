import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [Header, Footer, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  
  perfilForm!: FormGroup;
  loading = signal(false);

  ngOnInit() {
    this.initForm();
    this.cargarDatosUsuario();
  }

  initForm() {
    this.perfilForm = this.fb.nonNullable.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50)
      ]],
      usuario: [{value: '', disabled: true}, [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(18),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      contrasenia: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  cargarDatosUsuario() {
    this.loading.set(true);
    
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.perfilForm.patchValue({
        nombre: currentUser.nombre,
        usuario: currentUser.usuario,
        email: currentUser.email
      });
    }
    this.loading.set(false);
  }

  onSubmit() {
    if (this.perfilForm.valid) {
      const confirmacion = confirm('¿Estás seguro de que deseas actualizar tu perfil?');
      
      if (confirmacion) {
        this.actualizarPerfil();
      }
    } else {
      alert('Por favor, completa todos los campos correctamente. La contraseña es requerida para confirmar los cambios.');
    }
  }

  actualizarPerfil() {
    this.loading.set(true);
    const datosActualizados = {
      nombre: this.perfilForm.value.nombre,
      email: this.perfilForm.value.email,
      contraseniaActual: this.perfilForm.value.contrasenia
    };
    
    setTimeout(() => {
      this.loading.set(false);
      alert('Perfil actualizado exitosamente');
      this.cargarDatosUsuario();
    }, 1000);
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
