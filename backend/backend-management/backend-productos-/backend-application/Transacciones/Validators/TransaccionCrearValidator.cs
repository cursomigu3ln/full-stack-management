using backend_productos_.backend_application.Transacciones.Dtos;
using FluentValidation;

namespace backend_productos_.backend_application.Transacciones.Validators
{
    public class TransaccionCrearValidator : AbstractValidator<TransaccionCrearRequest>
    {
        public TransaccionCrearValidator()
        {
            RuleFor(x => x.TipoTransaccion)
                .NotEmpty()
                .Must(t => t == "COMPRA" || t == "VENTA")
                .WithMessage("TipoTransaccion debe ser COMPRA o VENTA.");

            RuleFor(x => x.IdProducto).GreaterThan(0);
            RuleFor(x => x.Cantidad).GreaterThan(0);
            RuleFor(x => x.PrecioUnitario).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Detalle).MaximumLength(500);
        }
    }
}
