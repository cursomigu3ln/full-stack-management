using backend_productos_.backend_domain.Common;

namespace backend_productos_.backend_domain.Entities
{
    public class Producto : EntidadBase
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }

        public int IdCategoria { get; set; } // FK -> categorias_producto.id
        public string? Imagen { get; set; }

        public decimal Precio { get; set; }
        public int Stock { get; set; }

 
        public CategoriaProducto? CategoriaProducto { get; set; }
    }
}
