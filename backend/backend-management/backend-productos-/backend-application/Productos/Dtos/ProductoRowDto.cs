namespace backend_productos_.backend_application.Productos.Dtos
{
    public class ProductoRowDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public string? Descripcion { get; set; }
        public int IdCategoria { get; set; }
        public string? CategoriaNombre { get; set; }
        public string? Imagen { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public byte Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualiza { get; set; }
    }
}
