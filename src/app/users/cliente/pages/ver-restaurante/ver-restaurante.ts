import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import { ClienteService } from '../../../../services/cliente.service';
import {
  RestauranteDetail,
  ProductoResumen,
  ReseniaResumen,
  ReseniaCreate,
  PedidoCreate,
  DetallePedido,
  DireccionDTO,
  Tarjeta
} from '../../../../models/app.models';

// Interface para items del carrito
interface CarritoItem {
  producto: ProductoResumen;
  cantidad: number;
}

@Component({
  selector: 'app-ver-restaurante',
  imports: [Header, FooterCliente, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ver-restaurante.html',
  styleUrl: './ver-restaurante.css',
})
export class VerRestaurante implements OnInit {
  private route = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);
  private fb = inject(FormBuilder);

  restaurante: RestauranteDetail | null = null;
  menu: ProductoResumen[] = [];
  resenias: ReseniaResumen[] = [];
  loading = true;
  loadingMenu = true;
  nombreRestaurante = '';

  // Formulario para nueva reseña
  reseniaForm: FormGroup;
  submittingResenia = false;
  mostrarFormularioResenia = false;

  // Array para mostrar estrellas
  estrellas = [1, 2, 3, 4, 5];

  // Carrito de compras
  carrito: CarritoItem[] = [];

  // Modal de pedido
  mostrarModalPedido = false;
  direcciones: DireccionDTO[] = [];
  metodosPago: Tarjeta[] = [];
  direccionSeleccionada?: number;
  metodoPagoSeleccionado?: number;
  enviandoPedido = false;

  constructor() {
    this.reseniaForm = this.fb.group({
      resenia: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      calificacion: [5, [Validators.required, Validators.min(0.1), Validators.max(5)]]
    });
  }

  ngOnInit() {
    // Obtenemos el usuario del restaurante de la URL (ya que el backend usa usuario, no nombre)
    this.nombreRestaurante = this.route.snapshot.paramMap.get('nombre') || '';
    if (this.nombreRestaurante) {
      this.cargarDatosRestaurante();
    } else {
      this.loading = false;
      console.error('No se proporcionó usuario de restaurante');
    }
  }

  cargarDatosRestaurante() {
    this.clienteService.getRestauranteByNombre(this.nombreRestaurante).subscribe({
      next: (restaurante) => {
        this.restaurante = restaurante;
        // Cargar menú y reseñas desde el backend
        this.menu = (restaurante.menu || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.resenias = restaurante.reseniasRestaurante || [];
        
        // Debug: Ver qué datos vienen en las reseñas
        console.log('🔍 Reseñas recibidas:', this.resenias);
        if (this.resenias.length > 0) {
          console.log('📝 Ejemplo de reseña:', this.resenias[0]);
          console.log('📝 JSON de la reseña:', JSON.stringify(this.resenias[0], null, 2));
          console.log('📝 Claves de la reseña:', Object.keys(this.resenias[0]));
        }
        
        this.loading = false;
        this.loadingMenu = false;
      },
      error: (error) => {
        console.error('Error cargando datos del restaurante:', error);
        this.loading = false;
        this.loadingMenu = false;
      }
    });
  }

  toggleFormularioResenia() {
    this.mostrarFormularioResenia = !this.mostrarFormularioResenia;
    if (!this.mostrarFormularioResenia) {
      this.reseniaForm.reset({
        resenia: '',
        calificacion: 5
      });
    }
  }

  establecerPuntuacion(calificacion: number) {
    this.reseniaForm.patchValue({ calificacion });
  }

  submitResenia() {
    console.log('🎯 submitResenia called');
    console.log('📋 Form valid?', this.reseniaForm.valid);
    console.log('📋 Form value:', this.reseniaForm.value);
    console.log('🏪 Restaurante:', this.restaurante);
    
    if (this.reseniaForm.valid && this.restaurante) {
      this.submittingResenia = true;

      const reseniaText = this.reseniaForm.value.resenia?.trim() || '';
      const puntuacionNum = Number(this.reseniaForm.value.calificacion) || 0;

      console.log('📝 Reseña text:', reseniaText, 'length:', reseniaText.length);
      console.log('⭐ Puntuación:', puntuacionNum);

      const reseniaData: ReseniaCreate = {
        restauranteId: this.restaurante.id,
        resenia: reseniaText,
        puntuacion: puntuacionNum
      };

      console.log('📤 Enviando reseña:', JSON.stringify(reseniaData, null, 2));

      this.clienteService.crearResenia(reseniaData).subscribe({
        next: (nuevaResenia) => {
          console.log('✅ Reseña creada:', nuevaResenia);

          // Recargar restaurante para obtener reseñas actualizadas
          if (this.nombreRestaurante) {
            this.cargarDatosRestaurante();
          }

          // Resetear formulario y ocultar
          this.reseniaForm.reset({
            resenia: '',
            calificacion: 5
          });
          this.mostrarFormularioResenia = false;
          this.submittingResenia = false;
        },
        error: (error) => {
          console.error('❌ Error enviando reseña:', error);
          console.error('📋 Datos enviados:', reseniaData);
          this.submittingResenia = false;
          
          let mensaje = 'Error al enviar la reseña.';
          if (error.error?.resenia) {
            mensaje = error.error.resenia;
          } else if (error.error?.puntuacion) {
            mensaje = error.error.puntuacion;
          } else if (error.error?.message) {
            mensaje = error.error.message;
          }
          alert(mensaje);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.reseniaForm.controls).forEach(key => {
        this.reseniaForm.get(key)?.markAsTouched();
      });
    }
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  calcularPromedioPuntuacion(): number {
    if (this.resenias.length === 0) return 0;
    const suma = this.resenias.reduce((acc, resenia) => acc + resenia.puntuacion, 0);
    return suma / this.resenias.length;
  }

  formatearPuntuacion(puntuacion: number): string {
    return puntuacion.toFixed(1);
  }

  // Métodos del carrito
  agregarAlCarrito(producto: ProductoResumen) {
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  removerDelCarrito(productoId: number) {
    const index = this.carrito.findIndex(item => item.producto.id === productoId);
    if (index > -1) {
      this.carrito.splice(index, 1);
    }
  }

  aumentarCantidad(productoId: number) {
    const item = this.carrito.find(item => item.producto.id === productoId);
    if (item) {
      item.cantidad++;
    }
  }

  disminuirCantidad(productoId: number) {
    const item = this.carrito.find(item => item.producto.id === productoId);
    if (item && item.cantidad > 1) {
      item.cantidad--;
    } else if (item && item.cantidad === 1) {
      this.removerDelCarrito(productoId);
    }
  }

  calcularTotalCarrito(): number {
    return this.carrito.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  }

  calcularCantidadTotalItems(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

  limpiarCarrito() {
    this.carrito = [];
  }

  procesarPedido() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Abrir modal y cargar datos
    this.mostrarModalPedido = true;
    this.cargarDatosModal();
  }

  cargarDatosModal() {
    // Cargar direcciones y métodos de pago en paralelo
    this.clienteService.getDirecciones().subscribe({
      next: (direcciones) => {
        this.direcciones = direcciones;
      },
      error: (error) => {
        console.error('Error cargando direcciones:', error);
        alert('Error cargando direcciones. Por favor, intenta de nuevo.');
      }
    });

    this.clienteService.getMetodosPago().subscribe({
      next: (metodos) => {
        this.metodosPago = metodos;
      },
      error: (error) => {
        console.error('Error cargando métodos de pago:', error);
        alert('Error cargando métodos de pago. Por favor, intenta de nuevo.');
      }
    });
  }

  cerrarModalPedido() {
    this.mostrarModalPedido = false;
    this.direccionSeleccionada = undefined;
    this.metodoPagoSeleccionado = undefined;
    this.enviandoPedido = false;
  }

  confirmarPedido() {
    // Validaciones
    if (!this.direccionSeleccionada) {
      alert('Por favor selecciona una dirección');
      return;
    }

    if (!this.metodoPagoSeleccionado) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    if (!this.restaurante) {
      alert('Error: restaurante no encontrado');
      return;
    }

    // Preparar datos del pedido
    const detalles: DetallePedido[] = this.carrito.map(item => ({
      productoId: item.producto.id,
      cantidad: item.cantidad
    }));

    const pedido: PedidoCreate = {
      restauranteId: this.restaurante.id,
      direccionId: this.direccionSeleccionada,
      pagoId: this.metodoPagoSeleccionado,
      detalles: detalles
    };

    // Enviar pedido
    this.enviandoPedido = true;
    this.clienteService.crearPedido(pedido).subscribe({
      next: (pedidoCreado) => {
        // Éxito
        alert(`¡Pedido realizado exitosamente!\nNúmero de pedido: ${pedidoCreado.id}\nTotal: ${this.formatearPrecio(this.calcularTotalCarrito())}`);
        this.limpiarCarrito();
        this.cerrarModalPedido();
      },
      error: (error) => {
        console.error('Error creando pedido:', error);
        this.enviandoPedido = false;

        // Manejo de errores más específico
        if (error.status === 400) {
          alert('Error en los datos del pedido. Por favor verifica la información.');
        } else if (error.status === 401) {
          alert('Error de autenticación. Por favor inicia sesión nuevamente.');
        } else {
          alert('Error creando el pedido. Por favor intenta de nuevo.');
        }
      }
    });
  }
}
