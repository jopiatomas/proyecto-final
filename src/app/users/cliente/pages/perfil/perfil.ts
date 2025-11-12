import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-perfil',
  imports: [Header, Footer],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {}
