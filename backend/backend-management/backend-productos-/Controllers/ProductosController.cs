
using backend_productos_.backend_application.Grid;
using backend_productos_.backend_application.Productos.Dtos;
using backend_productos_.backend_domain.Entities;
using backend_productos_.backend_infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_productos_.Controllers
{
    [Route("api/productos")]
    public class ProductosController : BaseApiController
    {
        private readonly InventarioDbContext _db;
        public ProductosController(InventarioDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> Listar([FromQuery] byte? estado = 1)
        {
            try
            {
                var q = _db.Productos.AsNoTracking();

                if (estado.HasValue)
                    q = q.Where(x => x.Estado == estado.Value);

                var data = await q.OrderBy(x => x.Nombre).ToListAsync();
                return OkResponse(data, "Listado de productos");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al listar productos", new { ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Obtener(int id)
        {
            try
            {
                var item = await _db.Productos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

                if (item == null)
                    return NotFoundResponse("Producto no encontrado", new { id });

                return OkResponse(item, "Producto encontrado");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al obtener producto", new { ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] ProductoCrearRequest req)
        {
            try
            {
                var catExiste = await _db.CategoriasProducto.AnyAsync(c => c.Id == req.IdCategoria);
                if (!catExiste)
                    return BadRequestResponse("La categoría no existe", new { idCategoria = req.IdCategoria });

                var entity = new Producto
                {
                    Nombre = req.Nombre.Trim(),
                    Descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim(),
                    IdCategoria = req.IdCategoria,
                    Imagen = string.IsNullOrWhiteSpace(req.Imagen) ? null : req.Imagen.Trim(),
                    Precio = req.Precio,
                    Stock = req.Stock,
                    Estado = req.Estado,
                    FechaCreacion = DateTime.UtcNow
                };

                _db.Productos.Add(entity);
                await _db.SaveChangesAsync();

                return CreatedResponse(entity, "Producto creado");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al crear producto", new { ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] ProductoCrearRequest req)
        {
            try
            {
                var entity = await _db.Productos.FirstOrDefaultAsync(x => x.Id == id);
                if (entity == null)
                    return NotFoundResponse("Producto no encontrado", new { id });

                var catExiste = await _db.CategoriasProducto.AnyAsync(c => c.Id == req.IdCategoria);
                if (!catExiste)
                    return BadRequestResponse("La categoría no existe", new { idCategoria = req.IdCategoria });

                entity.Nombre = req.Nombre.Trim();
                entity.Descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim();
                entity.IdCategoria = req.IdCategoria;
                entity.Imagen = string.IsNullOrWhiteSpace(req.Imagen) ? null : req.Imagen.Trim();
                entity.Precio = req.Precio;
                entity.Stock = req.Stock;
                entity.Estado = req.Estado;
                entity.FechaActualiza = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return OkResponse(entity, "Producto actualizado");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al actualizar producto", new { ex.Message });
            }
        }

        [HttpPatch("{id:int}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromQuery] byte estado)
        {
            try
            {
                if (estado != 0 && estado != 1)
                    return BadRequestResponse("Estado inválido (debe ser 0 o 1)", new { estado });

                var entity = await _db.Productos.FirstOrDefaultAsync(x => x.Id == id);
                if (entity == null)
                    return NotFoundResponse("Producto no encontrado", new { id });

                entity.Estado = estado;
                entity.FechaActualiza = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return OkResponse(new { id, estado }, "Estado actualizado");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al cambiar estado del producto", new { ex.Message });
            }
        }

        [HttpPost("admin")]
        public async Task<IActionResult> Admin([FromBody] GridRequest req)
        {
            try
            {
                var q = _db.Productos.AsNoTracking()
                    .Include(p => p.CategoriaProducto)
                    .AsQueryable();

                // filtros
                if (req.Filters != null)
                {
                    if (req.Filters.TryGetValue("estado", out var estadoObj) &&
                        byte.TryParse(estadoObj?.ToString(), out var estado))
                        q = q.Where(x => x.Estado == estado);

                    if (req.Filters.TryGetValue("id_categoria", out var catObj) &&
                        int.TryParse(catObj?.ToString(), out var idCategoria))
                        q = q.Where(x => x.IdCategoria == idCategoria);
                }

                // search
                if (!string.IsNullOrWhiteSpace(req.SearchPhrase))
                {
                    var like = req.SearchPhrase.Trim();
                    q = q.Where(x =>
                        x.Nombre.Contains(like) ||
                        (x.Descripcion != null && x.Descripcion.Contains(like)) ||
                        (x.CategoriaProducto != null && x.CategoriaProducto.Nombre.Contains(like))
                    );
                }

                var total = await q.CountAsync();

                // sort + paging
                var sort = req.Sort ?? new Dictionary<string, string> { { "Nombre", "asc" } };
                q = q.ApplySort(sort)
                     .ApplyPaging(req.Current, req.RowCount);

                // ✅ DTO (ya no anonymous)
                var rows = await q.Select(x => new ProductoRowDto
                {
                    Id = x.Id,
                    Nombre = x.Nombre,
                    Descripcion = x.Descripcion,
                    IdCategoria = x.IdCategoria,
                    CategoriaNombre = x.CategoriaProducto != null ? x.CategoriaProducto.Nombre : null,
                    Imagen = x.Imagen,
                    Precio = x.Precio,
                    Stock = x.Stock,
                    Estado = x.Estado,
                    FechaCreacion = x.FechaCreacion,
                    FechaActualiza = x.FechaActualiza
                }).ToListAsync();

                var result = new GridResult<ProductoRowDto>
                {
                    Total = total,
                    Rows = rows,
                    Current = req.Current,
                    RowCount = req.RowCount
                };

                return OkResponse(result, "Admin productos");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error en admin productos", new { ex.Message });
            }
        }

    }
}
