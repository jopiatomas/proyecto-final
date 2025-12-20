import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import { ClienteService } from '../../../../core/services/cliente.service';
import { Tarjeta, TarjetaRequest } from '../../../../core/models/app.models';

@Component({
  selector: 'app-metodos-pago',
  standalone: true,
  imports: [Header, ReactiveFormsModule, CommonModule, FooterCliente],
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
  confirmandoEliminacion = signal(false);
  idTarjetaParaEliminar = signal<number | null>(null);
  mensajeError = '';
  tipoMensaje: 'success' | 'error' | '' = '';

  // Propiedades para modal de alerta
  mostrarModalAlerta = false;
  tituloAlerta = '';
  mensajeAlerta = '';
  tipoAlerta: 'info' | 'warning' | 'error' | 'success' = 'info';

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarTarjetas();
  }

  inicializarFormulario() {
    this.formularioTarjeta = this.fb.nonNullable.group({
      tipo: ['', [Validators.required]],
      numero: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      titular: ['', [Validators.required, Validators.maxLength(100)]],
      vencimiento: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
          this.validarVencimiento.bind(this),
        ],
      ],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
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

    // Fecha mínima permitida: 01/28
    const mesMinimo = 1;
    const anioMinimo = 2028;

    // Verificar que no sea anterior a 01/28
    if (anioNum < anioMinimo || (anioNum === anioMinimo && mesNum < mesMinimo)) {
      return { vencimientoAntiguo: true };
    }

    // Verificar que no esté vencida (anterior al mes actual)
    if (anioNum < anioActual || (anioNum === anioActual && mesNum < mesActual)) {
      return { vencida: true };
    }

    return null;
  }

  formatearVencimiento(event: any) {
    let valor = event.target.value.replace(/\D/g, ''); // Eliminar todo excepto números

    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }

    this.formularioTarjeta.patchValue({ vencimiento: valor }, { emitEvent: false });
  }

  cargarTarjetas() {
    this.cargando.set(true);
    this.clienteService.getMetodosPago().subscribe({
      next: (tarjetas) => {
        this.tarjetas.set(tarjetas);
        this.cargando.set(false);
      },
      error: (error) => {
        this.cargando.set(false);
        // Si el backend devuelve error cuando no hay tarjetas, manejarlo
        if (error.status === 400 || error.status === 404) {
          this.tarjetas.set([]);
        }
      },
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
    this.idTarjetaParaEliminar.set(id);
    this.confirmandoEliminacion.set(true);
  }

  confirmarEliminacion() {
    const id = this.idTarjetaParaEliminar();
    if (!id) return;

    this.cargando.set(true);
    this.confirmandoEliminacion.set(false);
    this.clienteService.eliminarMetodoPago(id).subscribe({
      next: () => {
        this.cargarTarjetas();
        this.mensajeError = 'Tarjeta eliminada exitosamente';
        this.tipoMensaje = 'success';
        setTimeout(() => {
          this.mensajeError = '';
          this.tipoMensaje = '';
        }, 5000);
      },
      error: (error) => {
        this.cargando.set(false);
        this.mensajeError = `Error al eliminar la tarjeta: ${
          error.error?.message || error.message || 'Error desconocido'
        }`;
        this.tipoMensaje = 'error';
        setTimeout(() => {
          this.mensajeError = '';
          this.tipoMensaje = '';
        }, 5000);
      },
    });
  }

  cancelarEliminacion() {
    this.confirmandoEliminacion.set(false);
    this.idTarjetaParaEliminar.set(null);
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
          this.cargando.set(false);
          this.mostrarAlerta(
            'Error',
            `Error al agregar la tarjeta: ${
              error.error?.message || error.message || 'Error desconocido'
            }`,
            'error'
          );
        },
      });
    } else {
      this.mostrarAlerta(
        'Campos incompletos',
        'Por favor completa todos los campos correctamente',
        'warning'
      );
    }
  }

  // Métodos para modal de alerta
  mostrarAlerta(
    titulo: string,
    mensaje: string,
    tipo: 'info' | 'warning' | 'error' | 'success' = 'info'
  ) {
    this.tituloAlerta = titulo;
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.mostrarModalAlerta = true;
  }

  cerrarModalAlerta() {
    this.mostrarModalAlerta = false;
  }
}
