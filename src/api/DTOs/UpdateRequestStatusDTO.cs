namespace InventorySystemBackend.DTOs
{
    public class UpdateRequestStatusDTO
    {
        /// <summary>
        /// Valid values: "PENDING" | "RECEIVED" | "DENIED" | "CANCELLED"
        /// </summary>
        public required string request_status { get; set; }
    }
}
