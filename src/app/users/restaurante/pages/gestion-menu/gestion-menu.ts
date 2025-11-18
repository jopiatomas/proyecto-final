import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { ProductoService, ProductoCrearDTO, ProductoModificarDTO, ProductoDetailDTO } from '../../../../core/services/producto.service';
import { forkJoin } from 'rxjs';

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

  // Formulario
  formulario: Producto = {
    id: 0,
    nombre: '',
    caracteristicas: '',
    precio: 0,
    stock: 0
  };

  constructor(private productoService: ProductoService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.error = '';

    this.productoService.getAllProductos().subscribe({
      next: (resumenes: any[]) => {
        console.log('Productos recibidos del backend:', resumenes);

        // El endpoint de lista devuelve un Resumen (sin stock/caracteristicas).
        // Traemos el detalle por nombre para completar la info mostrada.
        const detailRequests = (resumenes || []).map(r => this.productoService.getProductoPorNombre(r.nombre));

        if (detailRequests.length === 0) {
          this.productos = [];
          this.aplicarFiltros();
          this.loading = false;
          return;
        }

        forkJoin(detailRequests).subscribe({
          next: (detalles: ProductoDetailDTO[]) => {
            this.productos = detalles.map(d => ({
              id: d.id,
              nombre: d.nombre,
              caracteristicas: d.caracteristicas,
              precio: d.precio,
              stock: d.stock
            }));
            this.aplicarFiltros();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al obtener detalles de productos:', err);
            this.error = 'No se pudieron cargar los detalles de los productos';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar los productos';
        this.loading = false;
        this.productos = [
      {
        id: 1,
        nombre: 'Pizza Napolitana',
        caracteristicas: 'Pizza con salsa de tomate, mozzarella, albahaca fresca y aceite de oliva',
        precio: 2500,
        stock: 10
      },
      {
        id: 2,
        nombre: 'Hamburguesa Completa',
        caracteristicas: 'Hamburguesa de carne con lechuga, tomate, queso, huevo y papas fritas',
        precio: 1800,
        stock: 15
      },
      {
        id: 3,
        nombre: 'Ensalada Caesar',
        caracteristicas: 'Lechuga romana, pollo grillado, croutons, parmesano y aderezo caesar',
        precio: 1500,
        stock: 8
      },
      {
        id: 4,
        nombre: 'Milanesa con Papas',
        caracteristicas: 'Milanesa de carne o pollo con papas fritas y ensalada',
        precio: 2200,
        stock: 12
      },
      {
        id: 5,
        nombre: 'Empanadas (docena)',
        caracteristicas: 'Docena de empanadas de carne, pollo, jamón y queso o verdura',
        precio: 2800,
        stock: 0
      },
      {
        id: 6,
        nombre: 'Tiramisú',
        caracteristicas: 'Postre italiano con café, mascarpone y cacao',
        precio: 1200,
        stock: 5
      },
      {
        id: 7,
        nombre: 'Coca Cola 1.5L',
        caracteristicas: 'Bebida gaseosa',
        precio: 800,
        stock: 20
      }
    ];
        this.aplicarFiltros();
      }
    });
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {
      const matchBusqueda = p.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
                           p.caracteristicas.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
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
    // Validaciones simples de formulario
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
      // Crear nuevo producto
      const nuevoProducto: ProductoCrearDTO = {
        nombre,
        caracteristicas,
        precio: precioNum,
        stock: stockNum
      };

      this.productoService.crearProducto(nuevoProducto).subscribe({
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
      // Actualizar producto existente
      const productoModificado: ProductoModificarDTO = {
        nombre,
        caracteristicas,
        precio: precioNum,
        stock: stockNum
      };

      this.productoService.modificarProducto(this.selectedProducto.id, productoModificado).subscribe({
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
      this.productoService.eliminarProducto(this.selectedProducto.id).subscribe({
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
