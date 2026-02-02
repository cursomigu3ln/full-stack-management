import { Routes } from '@angular/router';
import { TransaccionesListaComponent } from './pages/transacciones-lista/transacciones-lista.component';
import { TransaccionesFormComponent } from './pages/transacciones-form/transacciones-form.component';

export const TRANSACCIONES_ROUTES: Routes = [
  { path: '', component: TransaccionesListaComponent },
  { path: 'nuevo', component: TransaccionesFormComponent },
  { path: ':id/editar', component: TransaccionesFormComponent },
];
