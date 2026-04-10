/*
  SalesService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: SalesController.cs

  Endpoints covered:
    GET /api/sales/displayAll          → getAllSales()
    GET /api/sales/dashboardSummary    → getDashboardSummary()
    GET /api/sales/monthlySummary      → getMonthlySummary()

  HOW TransactionsPage USES getAllSales():
    Each sale record includes a `soldItems` array. The page maps that array
    into a "details" string:
      "Sale: 2x Apricot Premium, 1x Rose Classic"
    See the TransactionsPage for that mapping logic.

  HOW HomePage USES getDashboardSummary():
    Returns { totalInventory, pendingRequests, lowStockCount, totalRevenue }
    The page maps these onto the StatusCard components.
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

/**
 * Returns all sales for the caller's branch, newest first.
 * Each sale includes soldItems[] and employeeFullName.
 */
export const getAllSales = () => apiFetch("/sales/displayAll");

/**
 * Returns the four metrics used by the Dashboard home page.
 * Shape: { totalInventory, pendingRequests, lowStockCount, totalRevenue, lowStockThreshold }
 */
export const getDashboardSummary = () => apiFetch("/sales/dashboardSummary");

/**
 * Returns monthly revenue totals for the Forecast page chart.
 * Shape: [{ year, month, revenue, count }]
 *
 * @param {number} months — how many months back to query (default: 6)
 */
export const getMonthlySummary = (months = 6) =>
  apiFetch(`/sales/monthlySummary?months=${months}`);
