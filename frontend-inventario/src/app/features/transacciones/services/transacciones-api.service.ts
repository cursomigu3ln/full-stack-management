import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../../../shared/constants/api-response';
import { environment } from '../../../../environments/environment';
import { GridRequest, GridResult } from '../../../../shared/models/grid.model';

export type TipoTransaccion = 'COMPRA' | 'VENTA';

export type TransaccionCrearRequest = {
  fecha?: string; // ISO o yyyy-MM-dd según backend
  TipoTransaccion: TipoTransaccion;
  IdProducto: number;
  idProducto?: number | null;

  cantidad: number;
  precioUnitario: number;
  precioTotal: number;      // lo puedes autocalcular en el form
  detalle?: string | null;
};

export type TransaccionRowVm = {
  id: string;
  fecha: string;
  TipoTransaccion: TipoTransaccion;
  tipoTransaccion?:  TipoTransaccion;

  IdProducto: number;
  productoNombre?: string | null; // opcional para la tabla (si backend lo devuelve)
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;

  detalle?: string | null;
};

export type TransaccionVm = TransaccionCrearRequest & { id: string };

@Injectable({ providedIn: 'root' })
export class TransaccionesApiService {
  private readonly baseUrl = environment.apiUrl + '/api/transacciones';

  constructor(private http: HttpClient) {}

  obtener(id: string): Observable<ApiResponse<TransaccionVm>> {
    return this.http.get<ApiResponse<TransaccionVm>>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  crear(payload: TransaccionCrearRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}`, payload);
  }

  actualizar(id: string, payload: TransaccionCrearRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload);
  }

  admin(req: GridRequest): Observable<ApiResponse<GridResult<TransaccionRowVm>>> {
    return this.http.post<ApiResponse<GridResult<TransaccionRowVm>>>(`${this.baseUrl}/admin`, req);
  }
}
