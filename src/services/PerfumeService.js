/*
  PerfumeService.jsx  (legacy entry point — re-exports from ProductService)
  ─────────────────────────────────────────────────────────────────────────────
  This file was the original skeleton with an empty getInventory() and
  updateStock(). It now re-exports from the proper service files so that
  any existing import of "PerfumeService" still works without breaking.

  Prefer importing directly from ProductService.js or InventoryService.js
  in new code — those files have the full documented API.
  ─────────────────────────────────────────────────────────────────────────────
*/
export { getProducts, addProduct, updateProduct, archiveProduct } from "./ProductService";
export { getInventory, addToInventory, updateQuantity } from "./InventoryService";
