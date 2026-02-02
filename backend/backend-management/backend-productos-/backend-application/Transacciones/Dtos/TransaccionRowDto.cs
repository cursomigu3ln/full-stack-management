namespace backend_productos_.backend_application.Transacciones.Dtos
{
    public class TransaccionRowDto
    {
        public Guid Id { get; set; }
        public DateTime Fecha { get; set; }
        public string TipoTransaccion { get; set; } = "";
        public int ProductoId { get; set; }
        public string? ProductoNombre { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal PrecioTotal { get; set; }
        public string? Detalle { get; set; }
    }
}
