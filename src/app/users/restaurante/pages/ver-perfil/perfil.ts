import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { FooterRestaurante } from '../../components/footer/footer';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [Header, FooterRestaurante, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  
  formularioPerfil!: FormGroup;
  cargando = signal(false);

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarDatosUsuario();
  }

  inicializarFormulario() {
    this.formularioPerfil = this.fb.nonNullable.group({
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
    this.cargando.set(true);
    
    const usuarioActual = this.authService.currentUser();
    if (usuarioActual) {
      this.formularioPerfil.patchValue({
        nombre: usuarioActual.nombre,
        usuario: usuarioActual.usuario,
        email: usuarioActual.email
      });
    }
    this.cargando.set(false);
  }

  alEnviar() {
    if (this.formularioPerfil.valid) {
      const confirmacion = confirm('¿Estás seguro de que deseas actualizar tu perfil?');
      
      if (confirmacion) {
        this.actualizarPerfil();
      }
    } else {
      alert('Por favor, completa todos los campos correctamente. La contraseña es requerida para confirmar los cambios.');
    }
  }

  actualizarPerfil() {
    this.cargando.set(true);
    const datosActualizados = {
      nombre: this.formularioPerfil.value.nombre,
      email: this.formularioPerfil.value.email,
      contraseniaActual: this.formularioPerfil.value.contrasenia
    };
    
    setTimeout(() => {
      this.cargando.set(false);
      alert('Perfil actualizado exitosamente');
      this.cargarDatosUsuario();
    }, 1000);
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }
}
