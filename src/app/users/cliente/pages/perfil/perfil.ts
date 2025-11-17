import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

interface UsuarioCompleto {
  id: number;
  nombre: string;
  usuario: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

@Component({
  selector: 'app-perfil',
  imports: [Header, Footer, CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  perfilForm!: FormGroup;
  usuario = signal<UsuarioCompleto | null>(null);
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  ngOnInit() {
    this.initForm();
    this.cargarDatosUsuario();
  }

  initForm() {
    this.perfilForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(50)
      ]],
      usuario: ['', [
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
      telefono: ['', [
        Validators.pattern(/^[+]?[0-9\s\-()]{0,20}$/)
      ]],
      direccion: ['', [
        Validators.maxLength(200)
      ]]
    });
  }

  cargarDatosUsuario() {
    this.loading.set(true);
    
    // Intentar cargar datos guardados del localStorage primero
    const datosGuardados = localStorage.getItem('perfilUsuario');
    
    setTimeout(() => {
      let datosUsuario: UsuarioCompleto;
      
      if (datosGuardados) {
        // Si hay datos guardados, usarlos
        datosUsuario = JSON.parse(datosGuardados);
      } else {
        // Si no hay datos guardados, usar datos por defecto
        datosUsuario = {
          id: 1,
          nombre: 'Juan Pérez',
          usuario: 'juanperez',
          email: 'juan.perez@email.com',
          telefono: '+54 11 1234-5678',
          direccion: 'Av. Corrientes 1234, CABA'
        };
        // Guardar los datos por defecto
        localStorage.setItem('perfilUsuario', JSON.stringify(datosUsuario));
      }
      
      this.usuario.set(datosUsuario);
      this.perfilForm.patchValue(datosUsuario);
      this.loading.set(false);
    }, 1000);
  }

  onSubmit() {
    if (this.perfilForm.valid) {
      const confirmacion = confirm('¿Estás seguro de que deseas actualizar tu perfil?');
      
      if (confirmacion) {
        this.actualizarPerfil();
      }
    } else {
      this.marcarCamposComoTocados();
    }
  }

  actualizarPerfil() {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const datosActualizados = this.perfilForm.value;
    
    // Simular llamada al backend
    setTimeout(() => {
      try {
        console.log('Actualizando perfil:', datosActualizados);
        
        // Crear el objeto completo con ID
        const usuarioCompleto: UsuarioCompleto = {
          id: this.usuario()?.id || 1,
          ...datosActualizados
        };
        
        // Actualizar datos locales
        this.usuario.set(usuarioCompleto);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('perfilUsuario', JSON.stringify(usuarioCompleto));
        
        this.successMessage.set('Perfil actualizado correctamente');
        this.loading.set(false);
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this.successMessage.set(''), 3000);
      } catch (error) {
        this.errorMessage.set('Error al actualizar el perfil. Inténtalo de nuevo.');
        this.loading.set(false);
      }
    }, 1500);
  }

  marcarCamposComoTocados() {
    Object.keys(this.perfilForm.controls).forEach(key => {
      this.perfilForm.get(key)?.markAsTouched();
    });
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.perfilForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
