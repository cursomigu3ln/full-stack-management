import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {ToastService} from "../../../../../shared/services/toast.service";
import {Router} from "@angular/router";
import {CategoriasApiService} from "../../services/categorias-productos-api.service";
import {CategoriaProducto} from "../../../../core/models/categoria-producto.model";

@Component({
  selector: 'app-categorias-form',
  templateUrl: './categorias-productos-form.component.html',
  styleUrls: ['./categorias-productos-form.component.scss']
})
export class CategoriasProductosFormComponent {
  constructor(private fb: FormBuilder, private toast: ToastService,  private router: Router,   private categoriasApi: CategoriasApiService) {}
  categorias: CategoriaProducto[] = [];

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    descripcion: ['', [Validators.maxLength(300)]],
    estado: [1, [Validators.required]],
  });

  get f() { return this.form.controls; }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    // 🔜 luego conectamos service (POST/PUT)
    console.log('Categoria OK:', this.form.value);

    this.toast.success('Guardado', 'Producto guardado correctamente.');

  }
  ngOnInit(): void {

  }

  cancelar(): void {
    history.back();

  }


}
