namespace backend_productos_.backend_application.Transacciones.Dtos
{
    public class TransaccionCrearRequest
    {
        public string TipoTransaccion { get; set; } = null!; // COMPRA | VENTA
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public string? Detalle { get; set; }
    }
}
