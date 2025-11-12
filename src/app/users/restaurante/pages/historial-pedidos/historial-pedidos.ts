import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-historial-pedidos',
  imports: [Header, Footer],
  templateUrl: './historial-pedidos.html',
  styleUrl: './historial-pedidos.css',
})
export class HistorialPedidos {}
