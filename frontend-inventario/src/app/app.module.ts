import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';   // ✅ AÑADIR

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ProductosListaComponent } from './features/productos/pages/productos-lista/productos-lista.component';
import { ProductosFormComponent } from './features/productos/pages/productos-form/productos-form.component';
import { TransaccionesListaComponent } from './features/transacciones/pages/transacciones-lista/transacciones-lista.component';
import { TransaccionesFormComponent } from './features/transacciones/pages/transacciones-form/transacciones-form.component';

import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  CategoriasProductosListaComponent
} from "./features/categorias-productos/pages/categorias-productos-lista/categorias-productos-lista.component";
import {
  CategoriasProductosFormComponent
} from "./features/categorias-productos/pages/categorias-productos-form/categorias-productos-form.component";

@NgModule({
  declarations: [
    AppComponent,
    CategoriasProductosListaComponent,
    ProductosListaComponent,
    ProductosFormComponent,
    TransaccionesListaComponent,
    TransaccionesFormComponent,
    
    CategoriasProductosFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,   // ✅ AÑADIR
    AppRoutingModule,
    FormsModule,           //FORMS
    ReactiveFormsModule,   //FORMS REACTIVOS
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
