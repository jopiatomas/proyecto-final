import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-ver-pedidos',
  imports: [Header, Footer],
  templateUrl: './ver-pedidos.html',
  styleUrl: './ver-pedidos.css',
})
export class VerPedidos {}
