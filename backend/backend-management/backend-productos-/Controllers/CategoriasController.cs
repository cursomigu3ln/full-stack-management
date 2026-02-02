using backend_productos_.backend_application.Categorias.Dtos;
using backend_productos_.backend_application.Grid;
using backend_productos_.backend_domain.Entities;
using backend_productos_.backend_infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_productos_.Controllers
{
    [ApiController]
    [Route("api/categorias-productos")]
    public class CategoriasController  : BaseApiController
    {
        private readonly InventarioDbContext _db;

        public CategoriasController(InventarioDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] byte? estado = 1)
        {
            var query = _db.CategoriasProducto.AsNoTracking();

            if (estado.HasValue)
                query = query.Where(x => x.Estado == estado.Value);

            var data = await query
                .OrderBy(x => x.Nombre)
                .ToListAsync();

            return Ok(data);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> Obtener(int id)
        {
            try
            {
                var item = await _db.CategoriasProducto.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (item == null)
                    return NotFoundResponse("Categoría no encontrada", new { id });

                return OkResponse(item, "Categoría encontrada");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al obtener categoría", new { ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CategoriaCrearRequest req)
        {
            try
            {
                var existe = await _db.CategoriasProducto.AnyAsync(x => x.Nombre == req.Nombre);
                if (existe)
                    return BadRequestResponse("Ya existe una categoría con ese nombre", new { nombre = req.Nombre });

                var entity = new CategoriaProducto
                {
                    Nombre = req.Nombre.Trim(),
                    Descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim(),
                    Estado = req.Estado,
                    FechaCreacion = DateTime.UtcNow
                };

                _db.CategoriasProducto.Add(entity);
                await _db.SaveChangesAsync();

                return CreatedResponse(entity, "Categoría creada");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al crear categoría", new { ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] CategoriaActualizarRequest req)
        {
            try
            {
                var entity = await _db.CategoriasProducto.FirstOrDefaultAsync(x => x.Id == id);
                if (entity == null)
                    return NotFoundResponse("Categoría no encontrada", new { id });

                var duplicado = await _db.CategoriasProducto.AnyAsync(x => x.Id != id && x.Nombre == req.Nombre);
                if (duplicado)
                    return BadRequestResponse("Ya existe otra categoría con ese nombre", new { nombre = req.Nombre });

                entity.Nombre = req.Nombre.Trim();
                entity.Descripcion = string.IsNullOrWhiteSpace(req.Descripcion) ? null : req.Descripcion.Trim();
                entity.Estado = req.Estado;
                entity.FechaActualiza = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return OkResponse(entity, "Categoría actualizada");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al actualizar categoría", new { ex.Message });
            }
        }

        // Soft delete: cambia estado
        [HttpPatch("{id:int}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromQuery] byte estado)
        {
            try
            {
                if (estado != 0 && estado != 1)
                    return BadRequestResponse("Estado inválido (debe ser 0 o 1)", new { estado });

                var entity = await _db.CategoriasProducto.FirstOrDefaultAsync(x => x.Id == id);
                if (entity == null)
                    return NotFoundResponse("Categoría no encontrada", new { id });

                entity.Estado = estado;
                entity.FechaActualiza = DateTime.UtcNow;

                await _db.SaveChangesAsync();

                return OkResponse(new { id, estado }, "Estado actualizado");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al cambiar estado de la categoría", new { ex.Message });
            }
        }
        [HttpPost("admin")]
        public async Task<IActionResult> Admin([FromBody] GridRequest req)
        {
            try
            {
                var q = _db.CategoriasProducto.AsNoTracking().AsQueryable();

                // filtros
                if (req.Filters != null &&
                    req.Filters.TryGetValue("estado", out var estadoObj) &&
                    byte.TryParse(estadoObj?.ToString(), out var estado))
                {
                    q = q.Where(x => x.Estado == estado);
                }

                // search
                if (!string.IsNullOrWhiteSpace(req.SearchPhrase))
                {
                    var like = req.SearchPhrase.Trim();
                    q = q.Where(x =>
                        x.Nombre.Contains(like) ||
                        (x.Descripcion != null && x.Descripcion.Contains(like))
                    );
                }

                var total = await q.CountAsync();

                q = q.ApplySort(req.Sort)
                     .ApplyPaging(req.Current, req.RowCount);

                var rows = await q.Select(x => new CategoriaRowDto
                {
                    Id = x.Id,
                    Nombre = x.Nombre,
                    Descripcion = x.Descripcion,
                    Estado = x.Estado,
                    FechaCreacion = x.FechaCreacion,
                    FechaActualiza = x.FechaActualiza
                }).ToListAsync();

                return OkResponse(new GridResult<CategoriaRowDto>
                {
                    Total = total,
                    Rows = rows,
                    Current = req.Current,
                    RowCount = req.RowCount
                });
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error admin categorías", ex.Message);
            }
        }

    }
}
