export type TipoTransaccion = 'COMPRA' | 'VENTA';

export interface Transaccion {
  id: string;
  fecha: string;
  tipo: TipoTransaccion;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  detalle?: string | null;
}
