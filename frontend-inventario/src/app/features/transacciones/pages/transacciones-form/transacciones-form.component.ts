import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastService } from '../../../../../shared/services/toast.service';
import {
  TransaccionCrearRequest,
  TransaccionesApiService,
  TipoTransaccion,
} from '../../services/transacciones-api.service';

import {
  ProductoComboVm,
  ProductosApiService,
} from '../../../productos/services/productos-api.service';

/**
 * ✅ Validación compleja:
 * - Si TipoTransaccion = 'VENTA' => cantidad no puede ser mayor al stock del producto seleccionado
 * - Si TipoTransaccion = 'COMPRA' => no aplica restricción de stock
 */
export function stockDisponibleValidator(
  getProductos: () => ProductoComboVm[]
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const TipoTransaccion = group.get('TipoTransaccion')?.value as TipoTransaccion | null;

    const IdProducto = Number(group.get('IdProducto')?.value ?? 0);
    console.log("IdProducto",IdProducto)
    const cantidad = Number(group.get('cantidad')?.value ?? 0);

    // si falta data base, no bloquees
    if (!TipoTransaccion || !IdProducto || !cantidad || cantidad <= 0) return null;
    if (TipoTransaccion !== 'VENTA') return null;

    const productos = getProductos() || [];
    const prod = productos.find((p) => p.id === IdProducto);
    if (!prod) return null; // todavía no cargó productos

    const disponible = Number(prod.stock ?? 0);
    if (cantidad > disponible) {
      return {
        stockInsuficiente: { disponible, solicitado: cantidad, IdProducto },
      };
    }

    return null;
  };
}

@Component({
  selector: 'app-transacciones-form',
  templateUrl: './transacciones-form.component.html',
  styleUrls: ['./transacciones-form.component.scss'],
})
export class TransaccionesFormComponent implements OnInit {
  // -------- UI state --------
  guardando = false;
  cargandoProductos = false;

  // -------- mode --------
  modoEdicion = false;
  transaccionId: string | null = null;

  // -------- data --------
  TipoTransaccions: TipoTransaccion[] = ['COMPRA', 'VENTA'];
  productos: ProductoComboVm[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private api: TransaccionesApiService,
    private productosApi: ProductosApiService
  ) {}

  // -------- form --------
  form = this.fb.group(
    {

      TipoTransaccion: ['COMPRA' as TipoTransaccion, [Validators.required]],

      IdProducto: [null as number | null, [Validators.required, Validators.min(1)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],

      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      precioTotal: [{ value: 0, disabled: true }], // readonly

      detalle: ['', [Validators.maxLength(500)]],
    },
    {
      validators: [stockDisponibleValidator(() => this.productos)],
    }
  );

  get f() {
    return this.form.controls;
  }

  // -------- lifecycle --------
  ngOnInit(): void {
    this.setupAutoCalculoTotal();
    this.setupProductoToPrecioUnitario();
    this.setupRevalidacionStock();

    this.cargarProductosActivos();
    this.detectarModo();
  }
  private recalcularTotal(): void {
    const cantidad = Number(this.f.cantidad.value ?? 0);
    const pu = Number(this.f.precioUnitario.value ?? 0);
    const total = Math.max(0, cantidad * pu);

    // ✅ mejor setValue directo al control disabled
    this.form.get('precioTotal')?.setValue(total, { emitEvent: false });
  }
  // -------- setups --------
  private setupAutoCalculoTotal(): void {
    this.f.cantidad.valueChanges.subscribe(() => this.recalcularTotal());
    this.f.precioUnitario.valueChanges.subscribe(() => this.recalcularTotal());

    // inicial
    this.recalcularTotal();
  }

  /**
   * ✅ UX: Cuando selecciona producto, autocompleta precioUnitario
   */
  private setupProductoToPrecioUnitario(): void {
    this.f.IdProducto.valueChanges.subscribe((id) => {
      if (!id) return;

      const prod = this.productos.find((x) => x.id === Number(id));
      if (!prod) return;

      this.form.patchValue(
        { precioUnitario: Number(prod.precio ?? 0) },
        { emitEvent: true }
      );

      // ✅ forzar total
      this.recalcularTotal();
    });
  }

  /**
   * ✅ Revalida el validator de stock cuando cambie:
   * - TipoTransaccion
   * - IdProducto
   * - cantidad
   * - y también cuando ya cargaron productos del API
   */
  private setupRevalidacionStock(): void {
    const revalidate = () => this.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });

    this.f.TipoTransaccion.valueChanges.subscribe(revalidate);
    this.f.IdProducto.valueChanges.subscribe(revalidate);
    this.f.cantidad.valueChanges.subscribe(revalidate);
  }

  // -------- data loading --------
  private cargarProductosActivos(): void {
    this.cargandoProductos = true;

    // tu backend: GET /api/productos?estado=1
    this.productosApi.listar(1).subscribe({
      next: (res) => {
        this.cargandoProductos = false;

        if (!res?.success) {
          this.productos = [];
          this.toast.error('Error', res?.message || 'No se pudo cargar productos.');
          this.form.updateValueAndValidity(); // revalida por si dependía de productos
          return;
        }

        this.productos = res.data ?? [];

        if (this.productos.length === 0) {
          this.toast.info('Sin productos', 'No hay productos activos para seleccionar.');
        }

        // ✅ ahora que ya hay productos, revalidar stock
        this.form.updateValueAndValidity();
      },
      error: (err) => {
        console.error(err);
        this.cargandoProductos = false;
        this.productos = [];
        this.toast.error('Error', 'No se pudo cargar productos.');
        this.form.updateValueAndValidity();
      },
    });
  }

  // -------- mode / load --------
  private detectarModo(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.modoEdicion = true;
    this.transaccionId = id;
    this.cargarTransaccion(id);
  }

  private cargarTransaccion(id: string): void {
    this.api.obtener(id).subscribe({
      next: (res) => {
        if (!res?.success || !res?.data) {
          this.toast.warning('No encontrado', 'La transacción no existe o fue eliminada.');
          this.router.navigate(['/transacciones']);
          return;
        }

        const t = res.data;
        var cantidad=t.cantidad ?? 1;
        var precioUnitario=t.precioUnitario ?? 0;

        var precioTotal=cantidad*precioUnitario;
        this.form.patchValue({
          TipoTransaccion: (t.TipoTransaccion ?? 'COMPRA') as TipoTransaccion,
          IdProducto: (t.idProducto ?? null) as any,
          cantidad: cantidad,
          precioUnitario:precioUnitario ,
          precioTotal:precioTotal,

          detalle: t.detalle ?? '',
        });

        // ✅ revalidar stock luego del patch
        this.form.updateValueAndValidity();
      },
      error: (err) => {
        console.error(err);

        if (err?.status === 404) {
          this.toast.warning('No encontrado', 'La transacción no existe.');
          this.router.navigate(['/transacciones']);
          return;
        }

        this.toast.error('Error', 'No se pudo cargar la transacción desde el API.');
        this.router.navigate(['/transacciones']);
      },
    });
  }

  // -------- actions --------
  guardar(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      // si el motivo es stock insuficiente, mensaje específico
      const e: any = this.form.errors;
      if (e?.stockInsuficiente) {
        this.toast.warning(
          'Stock insuficiente',
          `Disponible ${e.stockInsuficiente.disponible} y solicitaste ${e.stockInsuficiente.solicitado}.`
        );
      } else {
        this.toast.warning('Formulario incompleto', 'Revisa los campos obligatorios.');
      }
      return;
    }

    this.guardando = true;

    const raw = this.form.getRawValue();

    const payload: TransaccionCrearRequest = {

      TipoTransaccion: raw.TipoTransaccion as TipoTransaccion,

      IdProducto: Number(raw.IdProducto),
      cantidad: Number(raw.cantidad),
      precioUnitario: Number(raw.precioUnitario),
      precioTotal: Number(raw.precioTotal),

      detalle: raw.detalle?.trim() || null,
    };

    const obs =
      this.modoEdicion && this.transaccionId
        ? this.api.actualizar(this.transaccionId, payload)
        : this.api.crear(payload);

    obs.subscribe({
      next: (res) => {
        this.guardando = false;

        if (!res?.success) {
          this.toast.error('Error', res?.message || 'No se pudo guardar.');
          return;
        }

        this.toast.success(
          'Guardado',
          this.modoEdicion ? 'Transacción actualizada.' : 'Transacción creada.'
        );

        this.router.navigate(['/transacciones']);
      },
      error: (err) => {
        console.error(err);
        this.guardando = false;
        this.toast.error('Error', 'Fallo al guardar la transacción.');
      },
    });
  }

  cancelar(): void {
    this.toast.info('Cancelado', 'No se guardaron cambios.');
    this.router.navigate(['/transacciones']);
  }

  // -------- helpers (para template) --------

  /** stock del producto seleccionado (para mostrar en hint) */
  get stockSeleccionado(): number | null {
    const id = Number(this.f.IdProducto.value ?? 0);
    if (!id) return null;
    const prod = this.productos.find((p) => p.id === id);
    return prod ? Number(prod.stock ?? 0) : null;
  }

  /** true si el error actual es stock insuficiente */
  get tieneErrorStock(): boolean {
    return !!this.form.errors?.['stockInsuficiente'];
  }

  /** objeto del error stock */
  get errorStock(): { disponible: number; solicitado: number; IdProducto: number } | null {
    const e: any = this.form.errors;
    return e?.stockInsuficiente ?? null;
  }
}
