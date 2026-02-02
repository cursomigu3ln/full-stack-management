using backend_productos_.backend_application.Common;
using backend_productos_.backend_infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_productos_.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        protected IActionResult OkResponse<T>(T data, string message = "OK")
            => Ok(ApiResponse<T>.Ok(data, message));

        protected IActionResult CreatedResponse<T>(T data, string message = "Creado")
            => StatusCode(201, ApiResponse<T>.Ok(data, message));

        protected IActionResult BadRequestResponse(string message, object? errorData = null)
            => BadRequest(ApiResponse<object>.Fail(message, errorData));

        protected IActionResult NotFoundResponse(string message, object? errorData = null)
            => NotFound(ApiResponse<object>.Fail(message, errorData));

        protected IActionResult ServerErrorResponse(string message, object? errorData = null)
            => StatusCode(500, ApiResponse<object>.Fail(message, errorData));
    }
}
