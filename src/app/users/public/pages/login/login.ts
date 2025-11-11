import { Component } from '@angular/core';
import { Header } from "../../components/header-public/header";
import { Footer } from "../../components/footer-public/footer";
import { LoginForm } from "../../components/login-form/login-form";

@Component({
  selector: 'app-login',
  imports: [Header, Footer, LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}
