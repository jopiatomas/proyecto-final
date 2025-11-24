import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { FooterCliente } from '../../components/footer/footer';
import {
  DetallePedidoDTO,
  DireccionDTO,
  PedidoCreate,
  ProductoResumen,
  ReseniaCreate,
  ReseniaResumen,
  RestauranteDetail,
  Tarjeta,
} from '../../../../core/models/app.models';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth-service';

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
  private authService = inject(AuthService);
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
  mensajeResenia = '';
  tipoMensajeResenia: 'success' | 'error' | '' = '';
  confirmandoResenia = false;

  // Array para mostrar estrellas
  estrellas = [1, 2, 3, 4, 5];

  // Carrito de compras
  carrito: CarritoItem[] = [];

  // Modal de pedido
  mostrarModalPedido = false;
  direcciones: DireccionDTO[] = [];
  metodosPago: Tarjeta[] = [];
  direccionSeleccionada?: number;
  direccionRestauranteSeleccionada?: number;
  metodoPagoSeleccionado?: number;
  enviandoPedido = false;
  confirmandoPedido = false;
  mensajePedido = '';
  tipoMensajePedido: 'success' | 'error' | '' = '';

  // Mensajes de stock
  mensajeStock = '';
  tipoMensajeStock: 'success' | 'error' | '' = '';

  constructor() {
    this.reseniaForm = this.fb.group({
      resenia: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      puntuacion: [5, [Validators.required, Validators.min(0.1), Validators.max(5)]],
    });
  }

  ngOnInit() {
    // Obtenemos el usuario del restaurante de la URL (ya que el backend usa usuario, no nombre)
    this.nombreRestaurante = this.route.snapshot.paramMap.get('nombre') || '';
    if (this.nombreRestaurante) {
      this.cargarDatosRestaurante();
    } else {
      this.loading = false;
    }
  }

  cargarDatosRestaurante() {
    this.clienteService.getRestauranteByNombre(this.nombreRestaurante).subscribe({
      next: (restaurante) => {
        this.restaurante = restaurante;
        // Cargar menú y reseñas desde el backend
        this.menu = (restaurante.menu || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.resenias = restaurante.reseniasRestaurante || [];
        this.loading = false;
        this.loadingMenu = false;
      },
      error: (error) => {
        this.loading = false;
        this.loadingMenu = false;
      },
    });
  }

  toggleFormularioResenia() {
    this.mostrarFormularioResenia = !this.mostrarFormularioResenia;
    this.mensajeResenia = '';
    this.tipoMensajeResenia = '';
    if (!this.mostrarFormularioResenia) {
      this.reseniaForm.reset({
        resenia: '',
        puntuacion: 5,
      });
    }
  }

  establecerPuntuacion(puntuacion: number) {
    this.reseniaForm.patchValue({ puntuacion });
  }

  submitResenia() {
    if (this.reseniaForm.valid && this.restaurante) {
      this.confirmandoResenia = true;
    } else {
      this.mensajeResenia = 'Por favor completa todos los campos correctamente';
      this.tipoMensajeResenia = 'error';
      setTimeout(() => {
        this.mensajeResenia = '';
        this.tipoMensajeResenia = '';
      }, 5000);
    }
  }

  enviarResenia() {
    this.confirmandoResenia = false;
    this.submittingResenia = true;

    const reseniaData: ReseniaCreate = {
      restauranteId: this.restaurante!.id,
      resenia: this.reseniaForm.value.resenia.trim(),
      puntuacion: this.reseniaForm.value.puntuacion,
    };

    this.clienteService.crearResenia(reseniaData).subscribe({
      next: (nuevaResenia) => {
        // Agregar la nueva reseña al principio de la lista
        const currentUser = this.authService.currentUser();
        const reseniaResumen: ReseniaResumen = {
          idCliente: nuevaResenia.idCliente,
          nombreCliente: currentUser?.usuario || '',
          resenia: nuevaResenia.resenia,
          puntuacion: nuevaResenia.puntuacion,
        };
        this.resenias.unshift(reseniaResumen);

        // Resetear formulario y ocultar
        this.reseniaForm.reset({
          resenia: '',
          puntuacion: 5,
        });
        this.mostrarFormularioResenia = false;
        this.submittingResenia = false;

        // Mostrar mensaje de éxito
        this.mensajeResenia = '¡Reseña enviada exitosamente!';
        this.tipoMensajeResenia = 'success';
        setTimeout(() => {
          this.mensajeResenia = '';
          this.tipoMensajeResenia = '';
        }, 5000);
      },
      error: (error) => {
        this.submittingResenia = false;

        // Extraer mensaje de error del backend
        let mensajeError = 'Error al enviar la reseña. Por favor, inténtalo de nuevo.';

        if (error.error && typeof error.error === 'string') {
          mensajeError = error.error;
        } else if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (error.message) {
          mensajeError = error.message;
        }

        this.mensajeResenia = mensajeError;
        this.tipoMensajeResenia = 'error';
        setTimeout(() => {
          this.mensajeResenia = '';
          this.tipoMensajeResenia = '';
        }, 5000);
      },
    });
  }

  cancelarConfirmacionResenia() {
    this.confirmandoResenia = false;
  }

  formatearPrecio(precio: number): string {
    return `$${precio.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
    // Validar stock antes de agregar
    if (!producto.stock || producto.stock === 0) {
      this.mostrarMensajeStock('Este producto no tiene stock disponible', 'error');
      return;
    }

    const itemExistente = this.carrito.find((item) => item.producto.id === producto.id);

    if (itemExistente) {
      // Validar que no exceda el stock disponible
      if (itemExistente.cantidad >= producto.stock) {
        this.mostrarMensajeStock(`Solo hay ${producto.stock} unidades disponibles de este producto`, 'error');
        return;
      }
      itemExistente.cantidad++;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  removerDelCarrito(productoId: number) {
    const index = this.carrito.findIndex((item) => item.producto.id === productoId);
    if (index > -1) {
      this.carrito.splice(index, 1);
    }
  }

  aumentarCantidad(productoId: number) {
    const item = this.carrito.find((item) => item.producto.id === productoId);
    if (item) {
      // Validar que no exceda el stock
      if (item.producto.stock && item.cantidad >= item.producto.stock) {
        this.mostrarMensajeStock(`Solo hay ${item.producto.stock} unidades disponibles de este producto`, 'error');
        return;
      }
      item.cantidad++;
    }
  }

  disminuirCantidad(productoId: number) {
    const item = this.carrito.find((item) => item.producto.id === productoId);
    if (item && item.cantidad > 1) {
      item.cantidad--;
    } else if (item && item.cantidad === 1) {
      this.removerDelCarrito(productoId);
    }
  }

  calcularTotalCarrito(): number {
    return this.carrito.reduce((total, item) => total + item.producto.precio * item.cantidad, 0);
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
        alert('Error cargando direcciones. Por favor, intenta de nuevo.');
      },
    });

    this.clienteService.getMetodosPago().subscribe({
      next: (metodos) => {
        this.metodosPago = metodos;
      },
      error: (error) => {
        alert('Error cargando métodos de pago. Por favor, intenta de nuevo.');
      },
    });
  }

  cerrarModalPedido() {
    this.mostrarModalPedido = false;
    this.direccionSeleccionada = undefined;
    this.direccionRestauranteSeleccionada = undefined;
    this.metodoPagoSeleccionado = undefined;
    this.enviandoPedido = false;
  }

  tieneStock(producto: ProductoResumen): boolean {
    return (producto.stock ?? 0) > 0;
  }

  obtenerCantidadEnCarrito(productoId: number): number {
    const item = this.carrito.find((item) => item.producto.id === productoId);
    return item ? item.cantidad : 0;
  }

  confirmarPedido() {
    // Validaciones
    if (!this.direccionSeleccionada) {
      this.mensajePedido = 'Por favor selecciona tu dirección de entrega';
      this.tipoMensajePedido = 'error';
      setTimeout(() => {
        this.mensajePedido = '';
        this.tipoMensajePedido = '';
      }, 5000);
      return;
    }

    if (!this.direccionRestauranteSeleccionada) {
      this.mensajePedido = 'Por favor selecciona la sucursal del restaurante';
      this.tipoMensajePedido = 'error';
      setTimeout(() => {
        this.mensajePedido = '';
        this.tipoMensajePedido = '';
      }, 5000);
      return;
    }

    if (!this.metodoPagoSeleccionado) {
      this.mensajePedido = 'Por favor selecciona un método de pago';
      this.tipoMensajePedido = 'error';
      setTimeout(() => {
        this.mensajePedido = '';
        this.tipoMensajePedido = '';
      }, 5000);
      return;
    }

    if (!this.restaurante) {
      this.mensajePedido = 'Error: restaurante no encontrado';
      this.tipoMensajePedido = 'error';
      setTimeout(() => {
        this.mensajePedido = '';
        this.tipoMensajePedido = '';
      }, 5000);
      return;
    }

    // Mostrar modal de confirmación
    this.confirmandoPedido = true;
  }

  realizarPedido() {
    this.confirmandoPedido = false;

    // Preparar datos del pedido
    const detalles: DetallePedidoDTO[] = this.carrito.map((item) => ({
      productoId: item.producto.id,
      cantidad: item.cantidad,
    }));

    const pedido: PedidoCreate = {
      restauranteId: this.restaurante!.id,
      direccionId: this.direccionSeleccionada!,
      direccionRestauranteId: this.direccionRestauranteSeleccionada!,
      pagoId: this.metodoPagoSeleccionado!,
      detalles: detalles,
    };

    // Enviar pedido
    this.enviandoPedido = true;
    this.clienteService.crearPedido(pedido).subscribe({
      next: (pedidoCreado) => {
        this.enviandoPedido = false;
        this.mensajePedido = `¡Pedido realizado exitosamente! Número de pedido: ${pedidoCreado.id}`;
        this.tipoMensajePedido = 'success';
        setTimeout(() => {
          this.mensajePedido = '';
          this.tipoMensajePedido = '';
        }, 5000);
        this.limpiarCarrito();
        this.cerrarModalPedido();
      },
      error: (error) => {
        this.enviandoPedido = false;

        // Manejo de errores más específico
        if (error.status === 400) {
          this.mensajePedido =
            error.error || 'Error en los datos del pedido. Por favor verifica la información.';
        } else if (error.status === 401) {
          this.mensajePedido = 'Error de autenticación. Por favor inicia sesión nuevamente.';
        } else {
          this.mensajePedido = 'Error al realizar el pedido. Por favor intenta nuevamente.';
        }
        this.tipoMensajePedido = 'error';
        setTimeout(() => {
          this.mensajePedido = '';
          this.tipoMensajePedido = '';
        }, 5000);
      },
    });
  }

  cancelarConfirmacionPedido() {
    this.confirmandoPedido = false;
  }

  mostrarMensajeStock(mensaje: string, tipo: 'success' | 'error') {
    this.mensajeStock = mensaje;
    this.tipoMensajeStock = tipo;
    setTimeout(() => {
      this.mensajeStock = '';
      this.tipoMensajeStock = '';
    }, 5000);
  }
}
