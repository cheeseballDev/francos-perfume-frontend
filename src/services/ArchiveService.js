/*
  ArchiveService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: ArchivingController.cs

  Endpoints covered:
    GET /api/archiving/displayAllAccounts     → getArchivedAccounts()
    GET /api/archiving/displayAllProducts     → getArchivedProducts()
    PUT /api/archiving/archiveAccount/:id     → archiveAccount()
    PUT /api/archiving/archiveProduct/:id     → archiveProduct()
    PUT /api/archiving/restoreAccount/:id     → restoreAccount()
    PUT /api/archiving/restoreProduct/:id     → restoreProduct()

  These are consumed by:
    ArchiveAccountsModal.jsx  — uses get + restore for accounts
    ArchiveProductsModal.jsx  — uses get + restore for products
    AccountInfoModal.jsx      — uses archiveAccount
    ProductService.js         — re-exports archiveProduct for convenience
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

// ── Read ─────────────────────────────────────────────────────────────────────

/** Returns all archived employee accounts. Shape: ArchivedAccounts[]. */
export const getArchivedAccounts = () => apiFetch("/archiving/displayAllAccounts");

/** Returns all archived products. Shape: ArchivedProducts[]. */
export const getArchivedProducts = () => apiFetch("/archiving/displayAllProducts");

// ── Archive ───────────────────────────────────────────────────────────────────

/**
 * Archives an employee account by their numeric employee_id.
 * Sets account_status = "archived" and creates an archive snapshot.
 */
export const archiveAccount = (employeeId) =>
  apiFetch(`/archiving/archiveAccount/${employeeId}`, { method: "PUT" });

/**
 * Archives a product by its numeric product_id.
 * Sets product_status = "archived" and creates an archive snapshot.
 */
export const archiveProduct = (productId) =>
  apiFetch(`/archiving/archiveProduct/${productId}`, { method: "PUT" });

// ── Restore (Rollback) ────────────────────────────────────────────────────────

/**
 * Restores an archived account back to "active" status.
 * @param {number} archiveId — account_archive_id (PK of archiveaccountstable)
 */
export const restoreAccount = (archiveId) =>
  apiFetch(`/archiving/restoreAccount/${archiveId}`, { method: "PUT" });

/**
 * Restores an archived product back to "active" status.
 * @param {number} archiveId — product_archive_id (PK of archiveproductstable)
 */
export const restoreProduct = (archiveId) =>
  apiFetch(`/archiving/restoreProduct/${archiveId}`, { method: "PUT" });
