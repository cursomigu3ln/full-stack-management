namespace backend_productos_.backend_application.Categorias.Dtos
{
    public class CategoriaRowDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = "";
        public string? Descripcion { get; set; }
        public byte Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualiza { get; set; }
    }
}
