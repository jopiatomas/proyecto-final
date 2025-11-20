import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
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
  imports: [Header, Footer, CommonModule, FormsModule],
  templateUrl: './gestion-menu.html',
  styleUrl: './gestion-menu.css',
})
export class GestionMenu implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  selectedProducto: Producto | null = null;
  isEditing = false;
  isAdding = false;
  filtroBusqueda = '';
  loading = false;
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
    this.loading = true;
    this.error = '';

    this.restauranteService.getAllProductos().subscribe({
      next: (productos: ProductoDetailDTO[]) => {
        this.productos = productos.map(p => ({
          id: p.id,
          nombre: p.nombre,
          caracteristicas: p.caracteristicas || '',
          precio: p.precio,
          stock: p.stock !== undefined ? p.stock : 0
        }));
        
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar los productos';
        this.productos = [];
        this.aplicarFiltros();
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {
      const matchBusqueda = p.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
      (p.caracteristicas || '').toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      return matchBusqueda;
    });
  }

  seleccionarProducto(producto: Producto) {
    this.selectedProducto = producto;
    this.isEditing = true;
    this.isAdding = false;
    this.formulario = { ...producto };
  }

  nuevoProducto() {
    this.selectedProducto = null;
    this.isEditing = false;
    this.isAdding = true;
    this.formulario = {
      id: 0,
      nombre: '',
      caracteristicas: '',
      precio: 0,
      stock: 0
    };
  }

  cerrarFormulario() {
    this.selectedProducto = null;
    this.isEditing = false;
    this.isAdding = false;
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

    if (this.isAdding) {
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
          const backendMsg = typeof err?.error === 'string' ? err.error : (err?.error?.message || err?.message);
          this.error = backendMsg || 'Error al crear el producto';
        }
      });
    } else if (this.isEditing && this.selectedProducto) {
      const productoModificado: ProductoModificarDTO = {
        nombre,
        caracteristicas,
        precio: precioNum,
        stock: stockNum
      };

      this.restauranteService.modificarProducto(this.selectedProducto.id, productoModificado).subscribe({
        next: (producto) => {
          console.log('Producto actualizado:', producto);
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('Error al actualizar producto:', err);
          const backendMsg = typeof err?.error === 'string' ? err.error : (err?.error?.message || err?.message);
          this.error = backendMsg || 'Error al actualizar el producto';
        }
      });
    }
  }

  eliminarProducto() {
    if (this.selectedProducto && confirm(`¿Estás seguro de eliminar "${this.selectedProducto.nombre}"?`)) {
      this.restauranteService.eliminarProducto(this.selectedProducto.id).subscribe({
        next: (mensaje) => {
          console.log(mensaje);
          this.cargarProductos();
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          this.error = 'Error al eliminar el producto';
        }
      });
    }
  }

  onBusquedaChange() {
    this.aplicarFiltros();
  }
}
