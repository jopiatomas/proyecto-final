import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { FooterCliente } from "../../components/footer/footer";


@Component({
  selector: 'app-realizar-resenia',
  imports: [Header, FooterCliente],
  templateUrl: './realizar-resenia.html',
  styleUrl: './realizar-resenia.css',
})
export class RealizarResenia {}
