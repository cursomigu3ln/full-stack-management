
using backend_productos_.backend_domain;
using backend_productos_.backend_domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend_productos_.backend_infrastructure.Persistence

{

    public class InventarioDbContext : DbContext
    {
        public InventarioDbContext(DbContextOptions<InventarioDbContext> options) : base(options) { }

        public DbSet<CategoriaProducto> CategoriasProducto => Set<CategoriaProducto>();
        public DbSet<Producto> Productos => Set<Producto>();
        public DbSet<Transaccion> Transacciones => Set<Transaccion>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CategoriaProducto>(e =>
            {
                e.ToTable("categorias_producto");
                e.HasKey(x => x.Id);

                e.Property(x => x.Id).HasColumnName("id");
                e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(150).IsRequired();
                e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(500);
                e.Property(x => x.Estado).HasColumnName("estado");
                e.Property(x => x.FechaCreacion).HasColumnName("fecha_creacion");
                e.Property(x => x.FechaActualiza).HasColumnName("fecha_actualiza");

                e.HasIndex(x => x.Nombre).IsUnique();
            });

            modelBuilder.Entity<Producto>(e =>
            {
                e.ToTable("productos");
                e.HasKey(x => x.Id);

                e.Property(x => x.Id).HasColumnName("id");
                e.Property(x => x.Nombre).HasColumnName("nombre").HasMaxLength(150).IsRequired();
                e.Property(x => x.Descripcion).HasColumnName("descripcion").HasMaxLength(500);
                e.Property(x => x.IdCategoria).HasColumnName("id_categoria").IsRequired();
                e.Property(x => x.Imagen).HasColumnName("imagen").HasMaxLength(600);
                e.Property(x => x.Precio).HasColumnName("precio").HasColumnType("decimal(18,2)");
                e.Property(x => x.Stock).HasColumnName("stock");
                e.Property(x => x.Estado).HasColumnName("estado");
                e.Property(x => x.FechaCreacion).HasColumnName("fecha_creacion");
                e.Property(x => x.FechaActualiza).HasColumnName("fecha_actualiza");

                e.HasOne(x => x.CategoriaProducto)
                    .WithMany()
                    .HasForeignKey(x => x.IdCategoria);

                e.HasIndex(x => x.IdCategoria);
            });

            modelBuilder.Entity<Transaccion>(e =>
            {
                e.ToTable("transacciones");
                e.HasKey(x => x.Id);

                e.Property(x => x.Id).HasColumnName("id");
                e.Property(x => x.Fecha).HasColumnName("fecha");
                e.Property(x => x.TipoTransaccion).HasColumnName("tipo_transaccion").HasMaxLength(10).IsRequired();
                e.Property(x => x.IdProducto).HasColumnName("id_producto").IsRequired();
                e.Property(x => x.Cantidad).HasColumnName("cantidad").IsRequired();
                e.Property(x => x.PrecioUnitario).HasColumnName("precio_unitario").HasColumnType("decimal(18,2)");
                e.Property(x => x.Detalle).HasColumnName("detalle").HasMaxLength(500);

                e.HasOne(x => x.Producto)
                    .WithMany()
                    .HasForeignKey(x => x.IdProducto);

                e.HasIndex(x => new { x.IdProducto, x.Fecha });
            });
        }
    }
}
