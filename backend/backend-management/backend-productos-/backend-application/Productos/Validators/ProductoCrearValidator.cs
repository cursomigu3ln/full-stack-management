using backend_productos_.backend_application.Productos.Dtos;
using FluentValidation;

namespace backend_productos_.backend_application.Productos.Validators
{
    public class ProductoCrearValidator : AbstractValidator<ProductoCrearRequest>
    {
        public ProductoCrearValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().MinimumLength(2).MaximumLength(150);

            RuleFor(x => x.Descripcion)
                .MaximumLength(500);

            RuleFor(x => x.Imagen)
                .MaximumLength(600)
                .Must(url => string.IsNullOrWhiteSpace(url) || url.StartsWith("http"))
                .WithMessage("Imagen debe ser una URL http/https.");

            RuleFor(x => x.IdCategoria).GreaterThan(0);
            RuleFor(x => x.Precio).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);

            RuleFor(x => x.Estado)
                .Must(x => x == 0 || x == 1);
        }
    }
}
