import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-ver-perfil',
  imports: [Header, Footer],
  templateUrl: './ver-perfil.html',
  styleUrl: './ver-perfil.css',
})
export class VerPerfil {}
