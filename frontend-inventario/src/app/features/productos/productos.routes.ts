
import {Routes} from "@angular/router";
import {ProductosListaComponent} from "./pages/productos-lista/productos-lista.component";
import {ProductosFormComponent} from "./pages/productos-form/productos-form.component";
export const PRODUCTOS_ROUTES: Routes = [
  { path: '', component: ProductosListaComponent },
  { path: 'nuevo', component: ProductosFormComponent },
  { path: ':id/editar', component: ProductosFormComponent },

];
