import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastService } from '../../../../../shared/services/toast.service';
import { CategoriasApiService } from '../../services/categorias-productos-api.service';

type CategoriaVm = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: number; // 0|1
};

type CategoriaCrearRequest = {
  nombre: string;
  descripcion?: string | null;
  estado: number;
};

@Component({
  selector: 'app-categorias-form',
  templateUrl: './categorias-productos-form.component.html',
  styleUrls: ['./categorias-productos-form.component.scss'],
})
export class CategoriasProductosFormComponent implements OnInit {
  guardando = false;

  modoEdicion = false;
  categoriaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private categoriasApi: CategoriasApiService
  ) {}

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    descripcion: ['', [Validators.maxLength(300)]],
    estado: [1, [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.detectarModo();
  }

  // -------- modo edición --------
  private detectarModo(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    if (!idStr) return;

    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) {
      this.toast.warning('Ruta inválida', 'El ID de la categoría no es válido.');
      this.router.navigate(['/categorias']);
      return;
    }

    this.modoEdicion = true;
    this.categoriaId = id;
    this.cargarCategoria(id);
  }

  private cargarCategoria(id: number): void {
    this.categoriasApi.obtener(id).subscribe({
      next: (res: any) => {
        if (!res?.success || !res?.data) {
          this.toast.warning('No encontrado', 'La categoría no existe o fue eliminada.');
          this.router.navigate(['/categorias']);
          return;
        }

        const c: CategoriaVm = res.data;

        this.form.patchValue({
          nombre: c.nombre ?? '',
          descripcion: c.descripcion ?? '',
          estado: Number(c.estado ?? 1),
        });
      },
      error: (err: any) => {
        console.error(err);

        if (err?.status === 404) {
          this.toast.warning('No encontrado', 'La categoría no existe.');
          this.router.navigate(['/categorias']);
          return;
        }

        this.toast.error('Error', 'No se pudo cargar la categoría desde el API.');
        this.router.navigate(['/categorias']);
      },
    });
  }

  // -------- acciones --------
  guardar(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toast.warning('Formulario incompleto', 'Revisa los campos obligatorios.');
      return;
    }

    if (this.guardando) return;
    this.guardando = true;

    const payload: CategoriaCrearRequest = {
      nombre: this.f.nombre.value!.trim(),
      descripcion: this.f.descripcion.value?.trim() || null,
      estado: Number(this.f.estado.value),
    };

    const obs =
      this.modoEdicion && this.categoriaId
        ? this.categoriasApi.actualizar(this.categoriaId, payload)
        : this.categoriasApi.crear(payload);

    obs.subscribe({
      next: (res: any) => {
        this.guardando = false;

        if (!res?.success) {
          this.toast.error('Error', res?.message || 'No se pudo guardar.');
          return;
        }

        this.toast.success(
          'Guardado',
          this.modoEdicion ? 'Categoría actualizada.' : 'Categoría creada.'
        );

        this.router.navigate(['/categorias-productos']);
      },
      error: (err: any) => {
        console.error(err);
        this.guardando = false;
        this.toast.error('Error', 'Fallo al guardar la categoría.');
      },
    });
  }

  cancelar(): void {
    this.toast.info('Cancelado', 'No se guardaron cambios.');
    this.router.navigate(['/categorias-productos']);
  }
}
