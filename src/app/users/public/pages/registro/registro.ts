import { Component } from '@angular/core';
import { Header } from "../../components/header-public/header";
import { Footer } from "../../components/footer-public/footer";
import { RegistroForm } from "../../components/registro-form/registro-form";

@Component({
  selector: 'app-registro',
  imports: [Header, Footer, RegistroForm],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

}
