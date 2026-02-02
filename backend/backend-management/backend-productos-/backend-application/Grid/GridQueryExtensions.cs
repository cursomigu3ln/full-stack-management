using System.Linq.Expressions;

namespace backend_productos_.backend_application.Grid
{
    public static class GridQueryExtensions
    {
        public static IQueryable<T> ApplyPaging<T>(this IQueryable<T> q, int current, int rowCount)
        {
            if (rowCount <= 0) return q; // traer todo
            if (current <= 0) current = 1;

            var offset = (current - 1) * rowCount;
            if (offset < 0) offset = 0;

            return q.Skip(offset).Take(rowCount);
        }

        // Sort por nombre de propiedad (simple). Para producción puedes mapear allowed fields.
        public static IQueryable<T> ApplySort<T>(this IQueryable<T> q, Dictionary<string, string>? sort)
        {
            if (sort == null || sort.Count == 0) return q;

            var field = sort.Keys.First();
            var dir = sort[field]?.Trim().ToLower() ?? "asc";

            var param = Expression.Parameter(typeof(T), "x");
            var prop = Expression.PropertyOrField(param, field);
            var lambda = Expression.Lambda(prop, param);

            var methodName = dir == "desc" ? "OrderByDescending" : "OrderBy";
            var result = Expression.Call(
                typeof(Queryable),
                methodName,
                new Type[] { typeof(T), prop.Type },
                q.Expression,
                Expression.Quote(lambda));

            return q.Provider.CreateQuery<T>(result);
        }
    }
}
