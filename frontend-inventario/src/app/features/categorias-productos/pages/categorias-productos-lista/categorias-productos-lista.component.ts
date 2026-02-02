import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { APP_ROUTES } from '../../../../../shared/constants/app-routes';
import { ToastService } from '../../../../../shared/services/toast.service';
import { GridRequest, GridResult, SortDir } from '../../../../../shared/models/grid.model';
import { CategoriasApiService } from '../../services/categorias-productos-api.service';

type EstadoFiltro = 1 | 0 | -1;

type CategoriaRowVm = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: number;
  fechaCreacion: string;
  fechaActualiza?: string | null;
};

@Component({
  selector: 'app-categorias-lista',
  templateUrl: './categorias-productos-lista.component.html',
  styleUrls: ['./categorias-productos-lista.component.scss'],
})
export class CategoriasProductosListaComponent implements OnInit {
  cargando = false;

  // grid state
  grid: GridResult<CategoriaRowVm> = { current: 1, rowCount: 10, total: 0, rows: [] };

  search = '';
  estado: EstadoFiltro = 1;

  sortField: string = 'Nombre';
  sortDir: SortDir = 'asc';

  private search$ = new Subject<string>();

  constructor(
    private router: Router,
    private toast: ToastService,
    private api: CategoriasApiService
  ) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(350)).subscribe((v) => {
      this.search = v;
      this.grid.current = 1;
      this.cargar();
    });

    this.cargar();
  }

  // -------- navegación --------
  irNuevo(): void {
    this.router.navigateByUrl(APP_ROUTES.categorias.nuevo);
  }

  irEditar(id: number): void {
    this.router.navigateByUrl(APP_ROUTES.categorias.editar(id));
  }

  // -------- UI events --------
  onSearchInput(ev: Event): void {
    const value = (ev.target as HTMLInputElement | null)?.value ?? '';
    this.search$.next(value);
  }

  cambiarEstadoFiltro(ev: Event): void {
    const value = (ev.target as HTMLSelectElement | null)?.value ?? '1';
    this.estado = Number(value) as any;
    this.grid.current = 1;
    this.cargar();
  }

  cambiarRowCount(ev: Event): void {
    const value = (ev.target as HTMLSelectElement | null)?.value ?? '10';
    this.grid.rowCount = Number(value);
    this.grid.current = 1;
    this.cargar();
  }

  ordenar(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.cargar();
  }

  cambiarPagina(page: number): void {
    if (page < 1 || page > this.totalPaginas) return;
    this.grid.current = page;
    this.cargar();
  }

  toggleEstado(c: CategoriaRowVm): void {
    const nuevoEstado = c.estado === 1 ? 0 : 1;

    this.api.cambiarEstado(c.id, nuevoEstado).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.toast.error('Error', res?.message || 'No se pudo cambiar estado.');
          return;
        }

        this.toast.success('Actualizado', `Estado cambiado a ${nuevoEstado === 1 ? 'Activo' : 'Inactivo'}.`);
        this.cargar();
      },
      error: (err: any) => {
        console.error(err);
        this.toast.error('Error', 'Fallo al cambiar estado.');
      },
    });
  }

  // -------- data loading --------
  cargar(): void {
    this.cargando = true;

    const req: GridRequest = {
      current: this.grid.current,
      rowCount: this.grid.rowCount,
      searchPhrase: this.search?.trim() || null,
      sort: { [this.sortField]: this.sortDir },
      filters: {},
    };

    if (this.estado !== -1) req.filters!['estado'] = this.estado;

    this.api.admin(req).subscribe({
      next: (res: any) => {
        this.cargando = false;

        if (!res?.success) {
          this.toast.error('Error', res?.message || 'No se pudo cargar el listado.');
          this.grid = { ...this.grid, rows: [], total: 0 };
          return;
        }

        this.grid = res.data ?? { current: 1, rowCount: this.grid.rowCount, total: 0, rows: [] };
      },
      error: (err: any) => {
        console.error(err);
        this.cargando = false;
        this.toast.error('Error', 'No se pudo cargar categorías.');
        this.grid = { ...this.grid, rows: [], total: 0 };
      },
    });
  }

  // -------- computed --------
  get hayDatos(): boolean {
    return (this.grid.rows?.length ?? 0) > 0;
  }

  get totalPaginas(): number {
    const rc = this.grid.rowCount || 10;
    return Math.max(1, Math.ceil((this.grid.total || 0) / rc));
  }

  get rangoTexto(): string {
    if (!this.hayDatos) return 'Mostrando 0 de 0';
    const start = (this.grid.current - 1) * this.grid.rowCount + 1;
    const end = Math.min(this.grid.current * this.grid.rowCount, this.grid.total);
    return `Mostrando ${start}-${end} de ${this.grid.total}`;
  }

  sortIcon(field: string): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }
}
