/*
  RequestService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: RequestsController.cs

  Endpoints covered:
    GET   /api/requests/displayAll             → getAllRequests()
    POST  /api/requests/add                    → createRequest()
    PATCH /api/requests/updateStatus/:id       → updateStatus()

  HOW INBOUND vs OUTBOUND WORKS:
    The server returns ALL requests for the caller's branch.
    The frontend (RequestPage) splits them into tabs using the branch_id
    on each request compared to the caller's own branch_id (stored in JWT).

    Currently the table only has one branch_id (the requester).
    A "true inbound" tab would need a target_branch_id column — see the
    RequestsController comments for more detail.
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

/**
 * Returns all requests for the caller's branch, newest first.
 * Shape: RequestDisplayDTO[] — includes product name, employee name, branch location.
 */
export const getAllRequests = () => apiFetch("/requests/displayAll");

/**
 * Creates a new stock request from the caller's branch.
 * branch_id and employee_id are derived from the JWT — never sent from the client.
 *
 * @param {{ product_id: number, request_qty: number, request_message?: string }} dto
 */
export const createRequest = (dto) =>
  apiFetch("/requests/add", {
    method: "POST",
    body: JSON.stringify(dto),
  });

/**
 * Updates the status of an existing request.
 * Valid values: "PENDING" | "RECEIVED" | "DENIED" | "CANCELLED"
 *
 * @param {number} requestId
 * @param {string} status
 */
export const updateStatus = (requestId, status) =>
  apiFetch(`/requests/updateStatus/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ request_status: status }),
  });
