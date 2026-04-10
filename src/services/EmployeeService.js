/*
  EmployeeService.js
  ─────────────────────────────────────────────────────────────────────────────
  Maps to: EmployeesController.cs

  Endpoints covered:
    GET  /api/employees/displayAll          → getAllEmployees()
    GET  /api/employees/displayOne/:id      → getEmployeeById()
    GET  /api/employees/profile             → getMyProfile()
    POST /api/employees/add                 → addEmployee()
    PUT  /api/employees/updateProfile/:id   → updateProfile()
    PUT  /api/employees/updateAuth/:id      → updateAuth()

  NOTE on roles:
    The .NET controller applies role-based scoping automatically from the JWT:
      - Admin    → sees all employees across all branches
      - Manager  → sees only employees in their branch
      - Staff    → same as manager (currently)
  ─────────────────────────────────────────────────────────────────────────────
*/
import { apiFetch } from "./api";

/** Returns employees visible to the caller based on their role + branch. */
export const getAllEmployees = () => apiFetch("/employees/displayAll");

/** Returns a single employee profile by numeric employee_id. */
export const getEmployeeById = (id) => apiFetch(`/employees/displayOne/${id}`);

/** Returns the caller's own profile (decoded from the JWT employee_id claim). */
export const getMyProfile = () => apiFetch("/employees/profile");

/**
 * Creates a new employee account.
 * The controller automatically:
 *   - Creates a profile row in employeeprofiletable
 *   - Creates an auth row in employeeauthenticationtable
 *   - Sets a temporary password ("PUTANGINAMO" — change before prod!)
 *   - Sets password_status = "temporary" so the employee must reset on first login
 *
 * @param {{ full_name, email, branch_id, contact_number, address,
 *           employee_shift, employee_role, employee_profile_picture }} dto
 */
export const addEmployee = (dto) =>
  apiFetch("/employees/add", {
    method: "POST",
    body: JSON.stringify(dto),
  });

/**
 * Updates the non-auth fields of an employee (name, branch, contact, etc.).
 *
 * @param {number} id — numeric employee_id
 * @param {{ full_name, branch_id, contact_number, address,
 *           employee_shift, employee_profile_picture }} dto
 */
export const updateProfile = (id, dto) =>
  apiFetch(`/employees/updateProfile/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });

/**
 * Updates auth fields: email, role, password_status, and optionally password.
 * If password_status is "active" and a new password is provided, the
 * controller hashes and stores it.
 *
 * @param {number} id — numeric employee_id (note: controller uses auth_id lookup by employee_id)
 * @param {{ email, employee_role, password_status, password? }} dto
 */
export const updateAuth = (id, dto) =>
  apiFetch(`/employees/updateAuth/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
