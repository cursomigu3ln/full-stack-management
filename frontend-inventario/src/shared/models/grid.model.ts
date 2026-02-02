export type SortDir = 'asc' | 'desc';

export interface GridRequest {
  current: number;      // 1..N
  rowCount: number;     // 5,10,25...
  searchPhrase?: string | null;
  sort?: Record<string, SortDir>;     // { Nombre: 'asc' }
  filters?: Record<string, any>;      // { estado: 1, id_categoria: 2 }
}

export interface GridResult<T> {
  current: number;
  rowCount: number;
  total: number;
  rows: T[];
}

