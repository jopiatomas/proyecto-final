import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-ver-restaurante',
  imports: [Header, Footer],
  templateUrl: './ver-restaurante.html',
  styleUrl: './ver-restaurante.css',
})
export class VerRestaurante {}
