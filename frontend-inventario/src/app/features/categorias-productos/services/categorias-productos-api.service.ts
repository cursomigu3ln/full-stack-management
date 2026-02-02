import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../../environments/environment";
import {CategoriaProducto} from "../../../core/models/categoria-producto.model";

@Injectable({ providedIn: 'root' })
export class CategoriasApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(estado: number | null = 1): Observable<CategoriaProducto[]> {
    let params = new HttpParams();
    if (estado !== null && estado !== undefined) {
      params = params.set('estado', String(estado));
    }

    return this.http.get<CategoriaProducto[]>(
      `${this.baseUrl}/api/categorias`,
      { params }
    );
  }
}
