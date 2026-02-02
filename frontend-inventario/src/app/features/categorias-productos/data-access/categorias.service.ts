import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/api/api.service';
import { ENDPOINTS } from 'src/app/core/api/endpoints';
import { Categoria } from 'src/app/core/models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
  constructor(private api: ApiService) {}

  listar(estado: number | null = 1) {
    const params = estado === null ? undefined : { estado };
    return this.api.get<Categoria[]>(ENDPOINTS.categorias, params);
  }
}
