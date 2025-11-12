import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro-form.html',
  styleUrl: './registro-form.css',
})
export class RegistroForm {

  registroForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(25)
      ]],
      usuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(18),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      contrasenia: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(15),
        Validators.pattern(/^[a-zA-Z0-9._]+$/)
      ]],
      rol: ['CLIENTE', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      // Preparar datos según el rol seleccionado
      const rol = this.registroForm.value.rol;
      const nombreIngresado = this.registroForm.value.nombre;
      
      const registerData: any = {
        usuario: this.registroForm.value.usuario,
        contrasenia: this.registroForm.value.contrasenia,
        rol: rol
      };

      // El backend espera campos diferentes según el rol
      if (rol === 'CLIENTE') {
        registerData.nombreYapellido = nombreIngresado;
      } else if (rol === 'RESTAURANTE') {
        registerData.nombreRestaurante = nombreIngresado;
      }

      console.log('===== DEBUG REGISTRO =====');
      console.log('Rol seleccionado:', rol);
      console.log('JSON que se enviará:', JSON.stringify(registerData));
      console.log('==========================');
    }
  }
}
