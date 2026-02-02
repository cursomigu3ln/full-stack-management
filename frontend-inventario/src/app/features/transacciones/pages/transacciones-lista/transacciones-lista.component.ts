import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';

import { ToastService } from '../../../../../shared/services/toast.service';
import { GridRequest, GridResult, SortDir } from '../../../../../shared/models/grid.model';
import { TransaccionRowVm, TransaccionesApiService } from '../../services/transacciones-api.service';

@Component({
  selector: 'app-transacciones-lista',
  templateUrl: './transacciones-lista.component.html',
  styleUrls: ['./transacciones-lista.component.scss'],
})
export class TransaccionesListaComponent implements OnInit {
  cargando = false;

  grid: GridResult<TransaccionRowVm> = { current: 1, rowCount: 10, total: 0, rows: [] };

  search = '';
  sortField: string = 'Fecha';
  sortDir: SortDir = 'desc';

  private search$ = new Subject<string>();

  constructor(
    private api: TransaccionesApiService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(350)).subscribe((v) => {
      this.search = v;
      this.grid.current = 1;
      this.cargar();
    });

    this.cargar();
  }

  irNuevo(): void {
    this.router.navigate(['/transacciones/nuevo']);
  }

  irEditar(id: string): void {
    this.router.navigate([`/transacciones/${encodeURIComponent(id)}/editar`]);
  }

  onSearchInput(ev: Event): void {
    const value = (ev.target as HTMLInputElement | null)?.value ?? '';
    this.search$.next(value);
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

  cambiarRowCount(ev: Event): void {
    const value = (ev.target as HTMLSelectElement | null)?.value ?? '10';
    this.grid.rowCount = Number(value);
    this.grid.current = 1;
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;

    const req: GridRequest = {
      current: this.grid.current,
      rowCount: this.grid.rowCount,
      searchPhrase: this.search?.trim() || null,
      sort: { [this.sortField]: this.sortDir },
      filters: {},
    };

    this.api.admin(req).subscribe({
      next: (res) => {
        this.cargando = false;

        if (!res?.success) {
          this.toast.error('Error', res?.message || 'No se pudo cargar el listado.');
          this.grid = { ...this.grid, rows: [], total: 0 };
          return;
        }

        this.grid = res.data ?? { current: 1, rowCount: this.grid.rowCount, total: 0, rows: [] };
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.toast.error('Error', 'No se pudo cargar transacciones.');
        this.grid = { ...this.grid, rows: [], total: 0 };
      },
    });
  }

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
