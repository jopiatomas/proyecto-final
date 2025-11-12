import { Component } from '@angular/core';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-gestion-menu',
  imports: [Header, Footer],
  templateUrl: './gestion-menu.html',
  styleUrl: './gestion-menu.css',
})
export class GestionMenu {}
