namespace backend_productos_.backend_application.Categorias.Dtos
{
    public class CategoriaCrearRequest
    {
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public byte Estado { get; set; } = 1;
    }
}
