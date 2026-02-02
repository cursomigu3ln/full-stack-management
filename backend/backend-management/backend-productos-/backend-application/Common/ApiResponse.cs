namespace backend_productos_.backend_application.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public T? Data { get; set; }

        public static ApiResponse<T> Ok(T? data, string message = "OK")
            => new ApiResponse<T> { Success = true, Message = message, Data = data };

        public static ApiResponse<T> Fail(string message, T? data = default)
            => new ApiResponse<T> { Success = false, Message = message, Data = data };
    }
}
