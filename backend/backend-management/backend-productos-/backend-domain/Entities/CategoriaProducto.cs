using backend_productos_.backend_domain.Common;

namespace backend_productos_.backend_domain.Entities
{
    public class CategoriaProducto : EntidadBase
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
    }
}
