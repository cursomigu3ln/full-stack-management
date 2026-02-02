namespace backend_productos_.backend_application.Grid
{
    public class GridResult<T>
    {
        public int Total { get; set; }
        public List<T> Rows { get; set; } = new();
        public int Current { get; set; }
        public int RowCount { get; set; }
    }
}
