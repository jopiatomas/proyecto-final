import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-metodos-pago',
  imports: [Header, Footer],
  templateUrl: './metodos-pago.html',
  styleUrl: './metodos-pago.css',
})
export class MetodosPago {}
