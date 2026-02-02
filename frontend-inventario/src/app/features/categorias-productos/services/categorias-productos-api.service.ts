import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";
import {CategoriaProducto} from "../../../core/models/categoria-producto.model";
import {ApiResponse} from "../../../../shared/constants/api-response";
import {GridRequest, GridResult} from "../../../../shared/models/grid.model";
export type CategoriaCrearRequest = {
  nombre: string;
  descripcion?: string | null;
  estado: number; // 0|1
};

export type CategoriaRowVm = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: number;
  fechaCreacion: string;
  fechaActualiza?: string | null;
};
export type CategoriaVm = CategoriaCrearRequest & { id: number };
@Injectable({ providedIn: 'root' })
export class CategoriasApiService {
  private readonly baseUrl = environment.apiUrl+ "/api/categorias-productos" // ajusta si usas IIS/https

  constructor(private http: HttpClient) {}

  listar(estado: number | null = 1): Observable<CategoriaProducto[]> {
    let params = new HttpParams();
    if (estado !== null && estado !== undefined) {
      params = params.set('estado', String(estado));
    }

    return this.http.get<CategoriaProducto[]>(
      `${this.baseUrl}`,
      { params }
    );
  }
  obtener(id: number): Observable<ApiResponse<CategoriaVm>> {
    return this.http.get<ApiResponse<CategoriaVm>>(`${this.baseUrl}/${id}`);
  }

  crear(payload: CategoriaCrearRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}`, payload);
  }

  actualizar(id: number, payload: CategoriaCrearRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, payload);
  }

  cambiarEstado(id: number, estado: 0 | 1): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/estado?estado=${estado}`, {});
  }

  admin(req: GridRequest): Observable<ApiResponse<GridResult<CategoriaRowVm>>> {
    return this.http.post<ApiResponse<GridResult<CategoriaRowVm>>>(`${this.baseUrl}/admin`, req);
  }
}
