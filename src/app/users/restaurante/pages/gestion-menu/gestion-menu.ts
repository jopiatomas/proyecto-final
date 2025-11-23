import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {FooterRestaurante } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { ProductoCrearDTO, ProductoDetailDTO, ProductoModificarDTO, RestauranteService } from '../../../../core/services/restaurante.service';


interface Producto {
  id: number;
  nombre: string;
  caracteristicas: string;
  precio: number;
  stock: number;
}

@Component({
  selector: 'app-gestion-menu',
  imports: [Header, FooterRestaurante, CommonModule, FormsModule],
  templateUrl: './gestion-menu.html',
  styleUrl: './gestion-menu.css',
})
export class GestionMenu implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  estaEditando = false;
  estaAgregando = false;
  filtroBusqueda = '';
  cargando = false;
  error = '';

  formulario: Producto = {
    id: 0,
    nombre: '',
    caracteristicas: '',
    precio: 0,
    stock: 0
  };

  constructor(private restauranteService: RestauranteService) {
  }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando = true;
    this.error = '';

    this.restauranteService.getAllProductos().subscribe({
  next: (productos) => {
    this.productos = productos.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      caracteristicas: p.caracteristicas || '',
      precio: p.precio,
      stock: p.stock ?? 0
    }));

    this.aplicarFiltros();
    this.cargando = false;
  },
  error: (err) => {
    console.error('Error al cargar productos:', err);
    if (err.status !== 404 && err.status !== 400) {
      this.error = 'Error al cargar los productos';
    }
    this.productos = [];
    this.aplicarFiltros();
    this.cargando = false;
  }
});
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      (p.caracteristicas || '').toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      return coincideBusqueda;
    });
  }

  seleccionarProducto(producto: Producto) {
    this.productoSeleccionado = producto;
    this.estaEditando = true;
    this.estaAgregando = false;
    this.formulario = { ...producto };
  }

  nuevoProducto() {
    this.productoSeleccionado = null;
    this.estaEditando = false;
    this.estaAgregando = true;
    this.error = '';  // Limpiar error al abrir formulario
    this.formulario = {
      id: 0,
      nombre: '',
      caracteristicas: '',
      precio: 0,
      stock: 0
    };
  }

  cerrarFormulario() {
    this.productoSeleccionado = null;
    this.estaEditando = false;
    this.estaAgregando = false;
    this.error = '';
  }

  guardarProducto() {
    this.error = '';
    const nombre = (this.formulario.nombre || '').trim();
    const caracteristicas = (this.formulario.caracteristicas || '').trim();
    const precioNum = Number(this.formulario.precio);
    const stockNum = Number(this.formulario.stock);

    if (!nombre || !caracteristicas) {
      this.error = 'Completa nombre y características';
      return;
    }
    if (isNaN(precioNum) || precioNum < 0) {
      this.error = 'Precio inválido';
      return;
    }
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      this.error = 'Stock inválido';
      return;
    }

    if (this.estaAgregando) {
      const nuevoProducto: ProductoCrearDTO = {
        nombre,
        caracteristicas,
        precio: precioNum,
        stock: stockNum
      };

      this.restauranteService.crearProducto(nuevoProducto).subscribe({
        next: (producto) => {
          console.log('Producto creado:', producto);
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('Error al crear producto:', err);
          const mensajeBackend = typeof err?.error === 'string' ? err.error : (err?.error?.message || err?.message);
          this.error = mensajeBackend || 'Error al crear el producto';
        }
      });
    } else if (this.estaEditando && this.productoSeleccionado) {
      const productoModificado: ProductoModificarDTO = {
        nombre,
        caracteristicas,
        precio: precioNum,
        stock: stockNum
      };

      this.restauranteService.modificarProducto(this.productoSeleccionado.id, productoModificado).subscribe({
        next: (producto) => {
          console.log('Producto actualizado:', producto);
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          const mensajeBackend = typeof err?.error === 'string' ? err.error : (err?.error?.message || err?.message);
          this.error = mensajeBackend || 'Error al actualizar el producto';
        }
      });
    }
  }
// hola que tal
  eliminarProducto() {
    if (this.productoSeleccionado && confirm(`¿Estás seguro de eliminar "${this.productoSeleccionado.nombre}"?`)) {
      this.restauranteService.eliminarProducto(this.productoSeleccionado.id).subscribe({
        next: (mensaje) => {
          console.log(mensaje);
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          this.error = 'No se puede eliminar el producto porque está asociado a pedidos del restaurante.';
        }
      });
    }
  }

  alCambiarBusqueda() {
    this.aplicarFiltros();
  }
}