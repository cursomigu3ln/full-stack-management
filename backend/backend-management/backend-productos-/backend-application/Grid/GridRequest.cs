namespace backend_productos_.backend_application.Grid
{
    public class GridRequest
    {
        public int Current { get; set; } = 1;          // current page
        public int RowCount { get; set; } = 10;        // per page (0 = all)
        public string? SearchPhrase { get; set; }      // global search

        // Ej: { "nombre": "asc" }
        public Dictionary<string, string>? Sort { get; set; }

        // Ej: { "estado": 1, "categoriaProductoId": 2 }
        public Dictionary<string, object>? Filters { get; set; }
    }
}
