import { Routes } from '@angular/router';
import {
  CategoriasProductosListaComponent
} from "./pages/categorias-productos-lista/categorias-productos-lista.component";
import {CategoriasProductosFormComponent} from "./pages/categorias-productos-form/categorias-productos-form.component";


export const CATEGORIAS_PRODUCTOS_ROUTES: Routes = [
  { path: '', component: CategoriasProductosListaComponent },
  { path: 'nuevo', component: CategoriasProductosFormComponent },
  { path: ':id/editar', component: CategoriasProductosFormComponent },
];
