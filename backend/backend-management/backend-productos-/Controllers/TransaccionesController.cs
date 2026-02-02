
using backend_productos_.backend_application.Grid;
using backend_productos_.backend_application.Transacciones.Dtos;
using backend_productos_.backend_domain.Entities;
using backend_productos_.backend_infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_productos_.Controllers
{
    [Route("api/transacciones")]
    public class TransaccionesController : BaseApiController
    {
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Actualizar(Guid id, [FromBody] TransaccionCrearRequest req)
        {
            var strategy = _db.Database.CreateExecutionStrategy();

            try
            {
                return await strategy.ExecuteAsync(async () =>
                {
                    await using var trx = await _db.Database.BeginTransactionAsync();

                    // 1️⃣ Obtener transacción original
                    var transaccion = await _db.Transacciones
                        .FirstOrDefaultAsync(x => x.Id == id);

                    if (transaccion == null)
                        return NotFoundResponse("Transacción no encontrada", new { id });

                    // 2️⃣ Bloquear producto original
                    var productoOriginal = await _db.Productos
                        .FromSqlInterpolated($@"
                    SELECT * FROM dbo.Productos WITH (UPDLOCK, HOLDLOCK)
                    WHERE Id = {transaccion.IdProducto}
                ")
                        .FirstOrDefaultAsync();

                    if (productoOriginal == null)
                        return BadRequestResponse("Producto original no existe");

                    // 3️⃣ Revertir stock de la transacción original
                    if (transaccion.TipoTransaccion == "VENTA")
                        productoOriginal.Stock += transaccion.Cantidad;
                    else if (transaccion.TipoTransaccion == "COMPRA")
                        productoOriginal.Stock -= transaccion.Cantidad;

                    // 4️⃣ Bloquear producto nuevo (puede ser el mismo)
                    Producto productoNuevo;

                    if (transaccion.IdProducto == req.IdProducto)
                    {
                        productoNuevo = productoOriginal;
                    }
                    else
                    {
                        productoNuevo = await _db.Productos
                            .FromSqlInterpolated($@"
                        SELECT * FROM dbo.Productos WITH (UPDLOCK, HOLDLOCK)
                        WHERE Id = {req.IdProducto}
                    ")
                            .FirstOrDefaultAsync();

                        if (productoNuevo == null)
                            return BadRequestResponse("Producto nuevo no existe", new { req.IdProducto });
                    }

                    if (productoNuevo.Estado != 1)
                        return BadRequestResponse("Producto está inactivo", new { req.IdProducto });

                    // 5️⃣ Aplicar nueva transacción
                    if (req.TipoTransaccion == "VENTA")
                    {
                        if (productoNuevo.Stock < req.Cantidad)
                        {
                            return BadRequestResponse(
                                "Stock insuficiente para la venta",
                                new
                                {
                                    stockActual = productoNuevo.Stock,
                                    cantidadSolicitada = req.Cantidad
                                }
                            );
                        }

                        productoNuevo.Stock -= req.Cantidad;
                    }
                    else if (req.TipoTransaccion == "COMPRA")
                    {
                        productoNuevo.Stock += req.Cantidad;
                    }
                    else
                    {
                        return BadRequestResponse("TipoTransaccion inválido", new { req.TipoTransaccion });
                    }

                    productoOriginal.FechaActualiza = DateTime.UtcNow;
                    productoNuevo.FechaActualiza = DateTime.UtcNow;

                    // 6️⃣ Actualizar transacción
                    transaccion.TipoTransaccion = req.TipoTransaccion;
                    transaccion.IdProducto = req.IdProducto;
                    transaccion.Cantidad = req.Cantidad;
                    transaccion.PrecioUnitario = req.PrecioUnitario;
                    transaccion.Detalle = string.IsNullOrWhiteSpace(req.Detalle) ? null : req.Detalle.Trim();
                    transaccion.Fecha = DateTime.UtcNow;

                    await _db.SaveChangesAsync();
                    await trx.CommitAsync();

                    return OkResponse(transaccion, "Transacción actualizada y stock ajustado");
                });
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al actualizar transacción", new { ex.Message });
            }
        }

        private readonly InventarioDbContext _db;
        public TransaccionesController(InventarioDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> Listar([FromQuery] int? idProducto = null)
        {
            try
            {
                var q = _db.Transacciones.AsNoTracking();

                if (idProducto.HasValue)
                    q = q.Where(x => x.IdProducto == idProducto.Value);

                var data = await q.OrderByDescending(x => x.Fecha).ToListAsync();
                return OkResponse(data, "Listado de transacciones");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al listar transacciones", new { ex.Message });
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Obtener(Guid id)
        {
            try
            {
                var item = await _db.Transacciones.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);

                if (item == null)
                    return NotFoundResponse("Transacción no encontrada", new { id });

                return OkResponse(item, "Transacción encontrada");
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al obtener transacción", new { ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] TransaccionCrearRequest req)
        {
            var strategy = _db.Database.CreateExecutionStrategy();

            try
            {
                return await strategy.ExecuteAsync(async () =>
                {
                    await using var trx = await _db.Database.BeginTransactionAsync();

                    var producto = await _db.Productos
                        .FromSqlInterpolated($@"
                    SELECT * FROM dbo.Productos WITH (UPDLOCK, HOLDLOCK)
                    WHERE Id = {req.IdProducto}
                ")
                        .FirstOrDefaultAsync();

                    if (producto == null)
                        return BadRequestResponse("Producto no existe", new { idProducto = req.IdProducto });

                    if (producto.Estado != 1)
                        return BadRequestResponse("Producto está inactivo", new { idProducto = req.IdProducto });

                    if (req.TipoTransaccion == "VENTA")
                    {
                        if (producto.Stock < req.Cantidad)
                        {
                            return BadRequestResponse(
                                "Stock insuficiente para la venta",
                                new { stockActual = producto.Stock, cantidadSolicitada = req.Cantidad }
                            );
                        }
                        producto.Stock -= req.Cantidad;
                    }
                    else if (req.TipoTransaccion == "COMPRA")
                    {
                        producto.Stock += req.Cantidad;
                    }
                    else
                    {
                        return BadRequestResponse("TipoTransaccion inválido", new { req.TipoTransaccion });
                    }

                    producto.FechaActualiza = DateTime.UtcNow;

                    var t = new Transaccion
                    {
                        Id = Guid.NewGuid(),
                        Fecha = DateTime.UtcNow, 
                        TipoTransaccion = req.TipoTransaccion,
                        IdProducto = req.IdProducto,
                        Cantidad = req.Cantidad,
                        PrecioUnitario = req.PrecioUnitario,
                        Detalle = string.IsNullOrWhiteSpace(req.Detalle) ? null : req.Detalle.Trim()
                    };

                    _db.Transacciones.Add(t);
                    await _db.SaveChangesAsync();

                    await trx.CommitAsync();

                    return CreatedResponse(t, "Transacción creada y stock actualizado");
                });
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error al crear transacción", new { ex.Message });
            }
        }
        [HttpPost("admin")]
        public async Task<IActionResult> Admin([FromBody] GridRequest req)
        {
            try
            {
                var q = _db.Transacciones
                    .AsNoTracking()
                    .Include(t => t.Producto)
                    .AsQueryable();

                // filtros
                if (req.Filters != null)
                {
                    if (req.Filters.TryGetValue("tipo", out var tipo))
                        q = q.Where(x => x.TipoTransaccion == tipo!.ToString());

                    if (req.Filters.TryGetValue("producto_id", out var pid) &&
                        int.TryParse(pid?.ToString(), out var productoId))
                        q = q.Where(x => x.IdProducto == productoId);
                }

                // search
                if (!string.IsNullOrWhiteSpace(req.SearchPhrase))
                {
                    var like = req.SearchPhrase.Trim();
                    q = q.Where(x =>
                        (x.Detalle != null && x.Detalle.Contains(like)) ||
                        (x.Producto != null && x.Producto.Nombre.Contains(like))
                    );
                }

                var total = await q.CountAsync();

                q = q.ApplySort(req.Sort ?? new Dictionary<string, string> { { "Fecha", "desc" } })
                     .ApplyPaging(req.Current, req.RowCount);

                var rows = await q.Select(x => new TransaccionRowDto
                {
                    Id = x.Id,
                    Fecha = x.Fecha,
                    TipoTransaccion = x.TipoTransaccion,
                    ProductoId = x.IdProducto,
                    ProductoNombre = x.Producto != null ? x.Producto.Nombre : null,
                    Cantidad = x.Cantidad,
                    PrecioUnitario = x.PrecioUnitario,
                    PrecioTotal = x.Cantidad * x.PrecioUnitario,
                    Detalle = x.Detalle
                }).ToListAsync();

                return OkResponse(new GridResult<TransaccionRowDto>
                {
                    Total = total,
                    Rows = rows,
                    Current = req.Current,
                    RowCount = req.RowCount
                });
            }
            catch (Exception ex)
            {
                return ServerErrorResponse("Error admin transacciones", ex.Message);
            }
        }
    }
}
