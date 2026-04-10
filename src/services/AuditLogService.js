/*
  AuditLogService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: AuditLogController.cs

  Endpoints covered:
    GET /api/auditlog/displayAll   → getAuditLogs()

  The server scopes results automatically:
    - Admin   → all logs across all branches
    - Manager → only logs from their branch (by branch_display_id claim)
    - Staff   → same as manager

  Audit logs are read-only — they are written automatically by every
  controller action that modifies data (add, update, archive, restore).
  You never need to write them from the frontend.
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

/**
 * Returns audit log entries visible to the caller.
 * Shape: [{ log_id, log_display_id, employee_display_id, branch_display_id,
 *           log_action, log_module, log_timestamp }]
 */
export const getAuditLogs = () => apiFetch("/auditlog/displayAll");
