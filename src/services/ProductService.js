/*
  ProductService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: ProductsController.cs + ArchivingController.cs (product archiving)

  Endpoints covered:
    GET  /api/products/displayAll           → getProducts()
    GET  /api/products/displayOne/:id       → getProductById()
    POST /api/products/add                  → addProduct()
    PUT  /api/products/updateProduct/:id    → updateProduct()
    PUT  /api/archiving/archiveProduct/:id  → archiveProduct()
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

/** Returns every product in the database (all statuses, all branches). */
export const getProducts = () => apiFetch("/products/displayAll");

/** Returns a single product by its numeric product_id. */
export const getProductById = (id) => apiFetch(`/products/displayOne/${id}`);

/**
 * Adds a new product to productstable.
 *
 * @param {{ product_name, product_type, product_note, product_gender,
 *           product_barcode, product_description }} dto
 */
export const addProduct = (dto) =>
  apiFetch("/products/add", {
    method: "POST",
    body: JSON.stringify(dto),
  });

/**
 * Updates an existing product's fields.
 * product_status can be "active" or "archived".
 *
 * @param {number} id  — numeric product_id
 * @param {{ product_name, product_type, product_note, product_gender,
 *           product_date_created, product_barcode,
 *           product_status, product_description }} dto
 */
export const updateProduct = (id, dto) =>
  apiFetch(`/products/updateProduct/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });

/**
 * Archives a product (sets product_status = "archived" and creates an archive snapshot).
 * Use ArchiveService.restoreProduct() to reverse this.
 *
 * @param {number} id — numeric product_id
 */
export const archiveProduct = (id) =>
  apiFetch(`/archiving/archiveProduct/${id}`, { method: "PUT" });
