
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../../../services/cliente.service';
import { Tarjeta, TarjetaRequest } from '../../../../models/app.models';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [Header, Footer, ReactiveFormsModule, CommonModule],
  templateUrl: './metodos-pago.html',
  styleUrl: './metodos-pago.css',
})
export class MetodosPago implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  
  tarjetas = signal<Tarjeta[]>([]);
  formularioTarjeta!: FormGroup;
  panelAbierto = signal(false);
  cargando = signal(false);

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarTarjetas();
  }

  inicializarFormulario() {
    this.formularioTarjeta = this.fb.nonNullable.group({
      tipo: ['', [Validators.required]],
      numero: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      titular: ['', [Validators.required, Validators.maxLength(100)]],
      vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/), this.validarVencimiento.bind(this)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  validarVencimiento(control: any) {
    const valor = control.value;
    if (!valor) return null;

    const [mes, anio] = valor.split('/');
    if (!mes || !anio) return null;

    // Convertir a números
    const mesNum = parseInt(mes, 10);
    const anioNum = parseInt('20' + anio, 10); // Convertir YY a YYYY

    // Fecha actual
    const ahora = new Date();
    const mesActual = ahora.getMonth() + 1; // getMonth() retorna 0-11
    const anioActual = ahora.getFullYear();

    // Fecha mínima permitida: 01/26
    const mesMinimo = 1;
    const anioMinimo = 2026;

    // Verificar que no sea anterior a 01/26
    if (anioNum < anioMinimo || (anioNum === anioMinimo && mesNum < mesMinimo)) {
      return { vencimientoAntiguo: true };
    }

    // Verificar que no esté vencida (anterior al mes actual)
    if (anioNum < anioActual || (anioNum === anioActual && mesNum < mesActual)) {
      return { vencida: true };
    }

    return null;
  }

  cargarTarjetas() {
    this.cargando.set(true);
    this.clienteService.getMetodosPago().subscribe({
      next: (tarjetas) => {
        console.log('Tarjetas recibidas del backend:', tarjetas);
        console.log('Tipo de tarjetas:', typeof tarjetas);
        console.log('Es array?:', Array.isArray(tarjetas));
        this.tarjetas.set(tarjetas);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar tarjetas:', error);
        console.error('Status del error:', error.status);
        console.error('Body del error:', error.error);
        this.cargando.set(false);
        // Si el backend devuelve error cuando no hay tarjetas, manejarlo
        if (error.status === 400 || error.status === 404) {
          this.tarjetas.set([]);
        }
      }
    });
  }

  abrirPanel() {
    this.panelAbierto.set(true);
    this.formularioTarjeta.reset();
  }

  cerrarPanel() {
    this.panelAbierto.set(false);
    this.formularioTarjeta.reset();
  }

  eliminarTarjeta(id: number) {
    if (confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      this.cargando.set(true);
      this.clienteService.eliminarMetodoPago(id).subscribe({
        next: () => {
          this.cargarTarjetas();
        },
        error: (error) => {
          console.error('Error al eliminar tarjeta:', error);
          this.cargando.set(false);
          alert(`Error al eliminar la tarjeta: ${error.error?.message || error.message || 'Error desconocido'}`);
        }
      });
    }
  }

  guardarTarjeta() {
    if (this.formularioTarjeta.valid) {
      this.cargando.set(true);
      const tarjetaRequest: TarjetaRequest = this.formularioTarjeta.value;
      
      this.clienteService.agregarMetodoPago(tarjetaRequest).subscribe({
        next: () => {
          this.cargarTarjetas();
          this.cerrarPanel();
        },
        error: (error) => {
          console.error('Error al agregar tarjeta:', error);
          this.cargando.set(false);
          alert(`Error al agregar la tarjeta: ${error.error?.message || error.message || 'Error desconocido'}`);
        }
      });
    } else {
      alert('Por favor completa todos los campos correctamente');
    }
  }
}
