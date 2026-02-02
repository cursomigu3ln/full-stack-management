import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiResponse} from "../../../../shared/constants/api-response";
import {environment} from "../../../../environments/environment";
import {GridRequest, GridResult} from "../../../../shared/models/grid.model";

export type ProductoCrearRequest = {
  nombre: string;
  descripcion?: string | null;
  idCategoria: number;
  imagen?: string | null;
  precio: number;
  stock: number;
  estado: number;
};
export type ProductoRowVm = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  idCategoria: number;
  categoriaNombre?: string | null;
  imagen?: string | null;
  precio: number;
  stock: number;
  estado: number;
  fechaCreacion: string;
  fechaActualiza?: string | null;
};
export type ProductoComboVm = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: number;
};
export type ProductoVm = ProductoCrearRequest & { id: number };

@Injectable({providedIn: 'root'})
export class ProductosApiService {
  private readonly baseUrl = environment.apiUrl + "/api/productos" // ajusta si usas IIS/https

  constructor(private http: HttpClient) {
  }

  obtener(id: number): Observable<ApiResponse<ProductoVm>> {
    return this.http.get<ApiResponse<ProductoVm>>(`${this.baseUrl}/${id}`);
  }

  crear(payload: ProductoCrearRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}`, payload);
  }

  actualizar(id: number, payload: ProductoCrearRequest): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, payload);
  }

  cambiarEstado(id: number, estado: 0 | 1): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/estado?estado=${estado}`, {});
  }

  admin(req: GridRequest): Observable<ApiResponse<GridResult<ProductoRowVm>>> {
    return this.http.post<ApiResponse<GridResult<ProductoRowVm>>>(`${this.baseUrl}/admin`, req);
  }
  listar(estado: 0 | 1 = 1): Observable<ApiResponse<ProductoComboVm[]>> {
    return this.http.get<ApiResponse<ProductoComboVm[]>>(`${this.baseUrl}?estado=${estado}`);
  }
}
