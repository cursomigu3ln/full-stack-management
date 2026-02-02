namespace backend_productos_.backend_domain.Entities
{
    public class Transaccion
    {
        public Guid Id { get; set; }
        public DateTime Fecha { get; set; }

        // "COMPRA" | "VENTA"
        public string TipoTransaccion { get; set; } = null!;

        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }

        public string? Detalle { get; set; }

        public Producto? Producto { get; set; }
    }
}
