using backend_productos_.backend_infrastructure.Persistence;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// ✅ Swagger UI real
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ DB: SQL Server
builder.Services.AddDbContext<InventarioDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("InventarioDb");
    options.UseSqlServer(cs, sql =>
    {
        sql.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null
        );
    });
});

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<backend_productos_.backend_application.Transacciones.Validators.TransaccionCrearValidator>();

// ✅ CORS ABIERTO (temporal, sin login)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Libre", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ✅ Swagger habilitado en Development (si quieres siempre, te lo dejo abajo)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // /swagger
}

// app.UseHttpsRedirection(); // puedes dejarlo o comentarlo si te estorba con http

app.UseCors("Libre");

// ✅ SIN AUTH (API libre) -> no necesitas Authorization
// app.UseAuthorization();

app.MapControllers();

app.Run();
