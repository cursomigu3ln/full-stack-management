import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {APP_ROUTES} from "../../../../../shared/constants/app-routes";

@Component({
  selector: 'app-categorias-lista',
  templateUrl: './categorias-productos-lista.component.html',
  styleUrls: ['./categorias-productos-lista.component.scss']
})
export class CategoriasProductosListaComponent {

  constructor(private router: Router) {}
  irNuevo(): void {
    this.router.navigateByUrl(APP_ROUTES.categorias.nuevo);
  }

  irEditar(id: number): void {
    this.router.navigateByUrl(APP_ROUTES.categorias.editar(id));
  }
}
