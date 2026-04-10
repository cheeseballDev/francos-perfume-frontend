/*
  InventoryService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: InventoryController.cs

  Endpoints covered:
    GET   /api/inventory/displayAll              → getInventory()
    POST  /api/inventory/add                     → addToInventory()
    PATCH /api/inventory/updateQuantity/:id?qty= → updateQuantity()

  NOTE on updateQuantity:
    The controller expects a query-string param `qty`, not a JSON body.
    A positive qty = increase, negative qty = decrease.
    The controller rejects qty that would bring the total to ≤ 0.
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

/**
 * Returns the inventory for the caller's branch (filtered by JWT branch_id).
 * Shape: InventoryDisplayDTO[] — includes product details + qty + branch.
 */
export const getInventory = () => apiFetch("/inventory/displayAll");

/**
 * Adds stock to a product in the caller's branch.
 * If no inventory row exists for that product+branch, the controller creates one.
 *
 * @param {{ product_id: number, product_quantity: number }} dto
 */
export const addToInventory = (dto) =>
  apiFetch("/inventory/add", {
    method: "POST",
    body: JSON.stringify(dto),
  });

/**
 * Adjusts the quantity of a product in inventory.
 * The controller adds `qty` to the current stock (use negative to decrease).
 *
 * @param {number} productId  — numeric product_id
 * @param {number} qty        — delta: +1 to increase, -1 to decrease, etc.
 */
export const updateQuantity = (productId, qty) =>
  apiFetch(`/inventory/updateQuantity/${productId}?qty=${qty}`, {
    method: "PATCH",
  });
