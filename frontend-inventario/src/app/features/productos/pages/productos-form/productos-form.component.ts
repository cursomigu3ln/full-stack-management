import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {ToastService} from "../../../../../shared/services/toast.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoriasApiService} from "../../../categorias-productos/services/categorias-productos-api.service";
import {ProductoCrearRequest, ProductosApiService} from "../../services/productos-api.service";


type CategoriaVm = { id: number; nombre: string; estado: number };

@Component({
  selector: 'app-productos-form',
  templateUrl: './productos-form.component.html',
  styleUrls: ['./productos-form.component.scss']
})
export class ProductosFormComponent implements OnInit {
  categorias: CategoriaVm[] = [];
  cargandoCategorias = false;
  guardando = false;

  modoEdicion = false;
  productoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private categoriasApi: CategoriasApiService,
    private productosApi: ProductosApiService
  ) {}

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    idCategoria: [null as number | null, [Validators.required]],
    descripcion: ['', [Validators.maxLength(500)]],
    imagen: ['', [
      Validators.maxLength(600),
      Validators.pattern(/^(https?:\/\/).+/i)
    ]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    estado: [1, [Validators.required]],
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.cargarCategoriasActivas();
    this.detectarModo();

    this.form.controls.imagen.valueChanges.subscribe(val => {
      const ctrl = this.form.controls.imagen;
      if (!val) ctrl.setErrors(null);
    });
  }

  private detectarModo(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    if (!idStr) return;

    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) {
      this.toast.warning('Ruta inválida', 'El ID del producto no es válido.');
      this.router.navigate(['/productos']);
      return;
    }

    this.modoEdicion = true;
    this.productoId = id;
    this.cargarProducto(id);
  }

  private cargarProducto(id: number): void {
    this.productosApi.obtener(id).subscribe({
      next: (res) => {

        if (!res?.success || !res?.data) {
          this.toast.warning('No encontrado', 'El producto no existe o fue eliminado.');
          this.router.navigate(['/productos']);
          return;
        }

        const p = res.data;

        this.form.patchValue({
          nombre: p.nombre ?? '',
          descripcion: p.descripcion ?? '',
          idCategoria: p.idCategoria ?? null,
          imagen: p.imagen ?? '',
          precio: p.precio ?? 0,
          stock: p.stock ?? 0,
          estado: p.estado ?? 1
        });
      },
      error: (err) => {
        console.error(err);


        if (err?.status === 404) {
          this.toast.warning('No encontrado', 'El producto no existe.');
          this.router.navigate(['/productos']);
          return;
        }


        this.toast.error('Error', 'No se pudo cargar el producto desde el API.');
        this.router.navigate(['/productos']);
      }
    });
  }

  private cargarCategoriasActivas(): void {
    this.cargandoCategorias = true;

    this.categoriasApi.listar(1).subscribe({
      next: (data) => {
        this.categorias = data ?? [];
        this.cargandoCategorias = false;

        if (this.categorias.length === 0) {
          this.toast.info('Sin categorías', 'No hay categorías activas para seleccionar.');
        }
      },
      error: (err) => {
        console.error(err);
        this.cargandoCategorias = false;
        this.toast.error('Error', 'No se pudo cargar categorías.');
      }
    });
  }

  get puedeGuardar(): boolean {
    return this.form.valid && !this.guardando;
  }

  guardar(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.warning('Formulario incompleto', 'Revisa los campos obligatorios.');
      return;
    }

    this.guardando = true;

    const payload: ProductoCrearRequest = {
      nombre: this.f.nombre.value!.trim(),
      descripcion: this.f.descripcion.value?.trim() || null,
      idCategoria: this.f.idCategoria.value!,
      imagen: this.f.imagen.value?.trim() || null,
      precio: Number(this.f.precio.value),
      stock: Number(this.f.stock.value),
      estado: Number(this.f.estado.value),
    };

    const obs = this.modoEdicion && this.productoId
      ? this.productosApi.actualizar(this.productoId, payload)
      : this.productosApi.crear(payload);

    obs.subscribe({
      next: (res) => {
        this.guardando = false;

        if (!res?.success) {
          this.toast.error('Error', res?.message || 'No se pudo guardar.');
          return;
        }

        this.toast.success('Guardado', this.modoEdicion ? 'Producto actualizado.' : 'Producto creado.');
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        console.error(err);
        this.guardando = false;
        this.toast.error('Error', 'Fallo al guardar el producto.');
      }
    });
  }

  cancelar(): void {
    this.toast.info('Cancelado', 'No se guardaron cambios.');
    this.router.navigate(['/productos']);
  }
}
