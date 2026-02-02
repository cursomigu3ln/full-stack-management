import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CATEGORIAS_PRODUCTOS_ROUTES } from './features/categorias-productos/categorias-productos.routes';
import { PRODUCTOS_ROUTES } from './features/productos/productos.routes';
import { TRANSACCIONES_ROUTES } from './features/transacciones/transacciones.routes';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  { path: 'categorias-productos', children: CATEGORIAS_PRODUCTOS_ROUTES },
  { path: 'productos', children: PRODUCTOS_ROUTES },
  { path: 'transacciones', children: TRANSACCIONES_ROUTES },
  { path: '**', redirectTo: 'productos' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
