namespace backend_productos_.backend_application.Productos.Dtos
{
    public class ProductoCrearRequest
    {
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public int IdCategoria { get; set; }
        public string? Imagen { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public byte Estado { get; set; } = 1;
    }
}
