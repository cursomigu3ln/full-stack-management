export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  categoriaId: number;
  imagen?: string | null;
  precio: number;
  stock: number;
  estado: number;
}
