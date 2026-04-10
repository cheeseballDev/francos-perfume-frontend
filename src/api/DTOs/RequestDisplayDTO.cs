namespace InventorySystemBackend.DTOs
{
    /// <summary>
    /// Shape returned by GET /api/requests/displayAll.
    /// Joins requesttable → productstable → employeeprofiletable → branchtable
    /// so the frontend never needs to do its own lookups.
    /// </summary>
    public class RequestDisplayDTO
    {
        public int RequestId { get; set; }
        public required string RequestDisplayId { get; set; }

        // Product info
        public int ProductId { get; set; }
        public string? ProductDisplayId { get; set; }
        public string? ProductName { get; set; }

        // Employee who made the request
        public int EmployeeId { get; set; }
        public string? EmployeeDisplayId { get; set; }
        public string? EmployeeFullName { get; set; }

        // Branch that made the request
        public int BranchId { get; set; }
        public string? BranchDisplayId { get; set; }
        public string? BranchLocation { get; set; }

        public int RequestQty { get; set; }
        public DateTime RequestDateSubmitted { get; set; }
        public string? RequestMessage { get; set; }
        public required string RequestStatus { get; set; }
    }
}
