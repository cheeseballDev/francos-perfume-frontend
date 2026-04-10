using InventorySystemBackend.Data;
using InventorySystemBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventorySystemBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalesController : ControllerBase
    {
        private readonly DatabaseContext dbContext;

        public SalesController(DatabaseContext dbContext)
        {
            this.dbContext = dbContext;
        }

        // ─── READ: ALL TRANSACTIONS ──────────────────────────────────────────

        /// <summary>
        /// Returns all sales transactions for the caller's branch, newest first.
        ///
        /// Each sale includes:
        ///   - The sale record itself (id, total, payment method, timestamp)
        ///   - The employee who processed it (name from employeeprofiletable)
        ///   - All sold items (product name, qty, price per unit)
        ///
        /// The frontend uses sold items to build the "details" column:
        ///   "Sale: 2x Apricot Premium, 1x Rose Classic"
        ///
        /// Admins see all branches.
        /// </summary>
        [HttpGet("displayAll")]
        public async Task<IActionResult> DisplayAll()
        {
            var claims   = new ClaimsGetter(User);
            var role     = claims.role;
            var branchId = int.Parse(claims.branchId);

            var query = dbContext.Sales.AsQueryable();

            if (role != "admin")
                query = query.Where(s => s.branch_id == branchId);

            var sales = await query
                .OrderByDescending(s => s.sales_timestamp)
                .Select(s => new
                {
                    s.sales_id,
                    s.sales_display_id,
                    s.sales_total,
                    s.sales_payment_method,
                    s.sales_timestamp,
                    // Join to employee profile for the name
                    employeeFullName = dbContext.EmployeeProfiles
                        .Where(e => e.employee_id == s.employee_id)
                        .Select(e => e.employee_full_name)
                        .FirstOrDefault(),
                    // Aggregate sold items into a list
                    soldItems = dbContext.SoldItems
                        .Where(si => si.sales_id == s.sales_id)
                        .Select(si => new
                        {
                            si.product_name,
                            si.sold_qty,
                            si.sales_price
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(sales);
        }

        // ─── READ: DASHBOARD SUMMARY ─────────────────────────────────────────

        /// <summary>
        /// Returns the four metric cards shown on the Dashboard home page.
        ///
        /// Data returned:
        ///   totalInventory  — sum of all product_qty in inventorytable for this branch
        ///   pendingRequests — count of requests where status = "PENDING"
        ///   lowStockCount   — count of products where qty ≤ lowStockThreshold
        ///   totalRevenue    — sum of sales_total for this branch (all time)
        ///                     Only meaningful for managers; staff will receive 0.
        ///
        /// LOW STOCK THRESHOLD:
        ///   Currently hardcoded to 10 units. To make this configurable, add a
        ///   setting to appsettings.json and inject IConfiguration here.
        /// </summary>
        [HttpGet("dashboardSummary")]
        public async Task<IActionResult> DashboardSummary()
        {
            const int LOW_STOCK_THRESHOLD = 10;

            var claims   = new ClaimsGetter(User);
            var role     = claims.role;
            var branchId = int.Parse(claims.branchId);

            // Total inventory for this branch
            var totalInventory = await dbContext.Inventories
                .Where(i => i.branch_id == branchId)
                .SumAsync(i => (int?)i.product_qty) ?? 0;

            // Pending requests from this branch
            var pendingRequests = await dbContext.Requests
                .Where(r => r.branch_id == branchId && r.request_status == "PENDING")
                .CountAsync();

            // Low stock: products in this branch below threshold
            var lowStockCount = await dbContext.Inventories
                .Where(i => i.branch_id == branchId && i.product_qty <= LOW_STOCK_THRESHOLD)
                .CountAsync();

            // Total revenue — only calculated for manager/admin roles
            decimal totalRevenue = 0;
            if (role == "manager" || role == "admin")
            {
                totalRevenue = await dbContext.Sales
                    .Where(s => s.branch_id == branchId)
                    .SumAsync(s => (decimal?)s.sales_total) ?? 0;
            }

            return Ok(new
            {
                totalInventory,
                pendingRequests,
                lowStockCount,
                totalRevenue,
                lowStockThreshold = LOW_STOCK_THRESHOLD
            });
        }

        // ─── READ: MONTHLY SUMMARY (for Forecast chart) ──────────────────────

        /// <summary>
        /// Returns total revenue grouped by month for the last N months.
        /// Used by ForecastPage when connecting to real sales data instead of CSV.
        ///
        /// Default: last 6 months.
        /// Query param: ?months=12 to override.
        /// </summary>
        [HttpGet("monthlySummary")]
        public async Task<IActionResult> MonthlySummary([FromQuery] int months = 6)
        {
            var claims   = new ClaimsGetter(User);
            var branchId = int.Parse(claims.branchId);

            var cutoff = DateTime.UtcNow.AddMonths(-months);

            var summary = await dbContext.Sales
                .Where(s => s.branch_id == branchId && s.sales_timestamp >= cutoff)
                .GroupBy(s => new { s.sales_timestamp.Year, s.sales_timestamp.Month })
                .Select(g => new
                {
                    year    = g.Key.Year,
                    month   = g.Key.Month,
                    revenue = g.Sum(s => s.sales_total),
                    count   = g.Count()
                })
                .OrderBy(g => g.year).ThenBy(g => g.month)
                .ToListAsync();

            return Ok(summary);
        }
    }
}
