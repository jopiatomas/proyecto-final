import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-direcciones',
  imports: [Header, Footer],
  templateUrl: './direcciones.html',
  styleUrl: './direcciones.css',
})
export class Direcciones {}
