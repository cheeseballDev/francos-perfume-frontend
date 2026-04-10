namespace InventorySystemBackend.DTOs
{
    public class AddRequestDTO
    {
        public int product_id { get; set; }
        public int request_qty { get; set; }
        public string? request_message { get; set; }
    }
}
