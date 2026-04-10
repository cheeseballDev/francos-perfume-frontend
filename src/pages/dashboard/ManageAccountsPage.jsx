import { ArchiveRestore, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ArchiveAccountsModal from "../../components/features/accounts_components/ArchiveAccountsModal";
import AccountInfoModal from "../../components/features/accounts_components/AccountInfoModal";
import CreateAccountModal from "../../components/features/accounts_components/CreateAccountModal";
import EditAccountModal from "../../components/features/accounts_components/EditAccountModal";
import FilterBar from "../../components/shared/FilterDropDown";
import SearchBar from "../../components/shared/SearchBar";
import { getAllEmployees, addEmployee, updateProfile, updateAuth } from "../../services/EmployeeService";

/*
  ManageAccountsPage
  ─────────────────────────────────────────────────────────────────────────────
  DATA FLOW:
    Mount / refresh → getAllEmployees() → GET /api/employees/displayAll
    Server returns: EmployeeProfiles[] — role-scoped (admin sees all, others see branch only).

  API ROW SHAPE (EmployeeProfiles entity):
    {
      employee_id, employee_display_id, branch_id, branch_display_id,
      contact_number, address, employee_shift, account_created,
      employee_full_name, employee_profile_picture
    }

  The auth data (email, role, status) is NOT returned by displayAll — it's
  on a separate table. To get those fields, you'd need to call displayAllAuths
  or join in the controller. For now the table shows what's available from
  the profile table and falls back to "—" for missing auth fields.
  ─────────────────────────────────────────────────────────────────────────────
*/

// Maps the API's snake_case fields to the short keys used in the table
const normalizeEmployee = (emp) => ({
  id:        emp.employee_display_id,
  _numId:    emp.employee_id,
  email:     emp.email          ?? "—",
  name:      emp.employee_full_name ?? "—",
  role:      emp.employee_role  ?? "—",
  branch:    emp.branch_display_id  ?? "—",
  date:      emp.account_created
               ? new Date(emp.account_created).toLocaleDateString("en-PH")
               : "—",
  status:    emp.account_status ?? "—",
  contactNo: emp.contact_number ?? "—",
  address:   emp.address        ?? "—",
  shift:     emp.employee_shift ?? "—",
});

const ManageAccountsPage = () => {
  const [accounts, setAccounts]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters]         = useState({ role: "", status: "" });

  const [isCreateModalOpen,  setIsCreateModalOpen]  = useState(false);
  const [isInfoModalOpen,    setIsInfoModalOpen]    = useState(false);
  const [isEditModalOpen,    setIsEditModalOpen]    = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount]       = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees();
      setAccounts(data.map(normalizeEmployee));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredData = accounts.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(q)  ||
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q);
    const matchesRole   = !filters.role   || filters.role   === "All Roles"   || user.role   === filters.role;
    const matchesStatus = !filters.status || filters.status === "All Status"  || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  const totalPages      = Math.ceil(filteredData.length / itemsPerPage);
  const currentAccounts = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Create ───────────────────────────────────────────────────────────────
  const handleSaveNewAccount = async (newAcc) => {
    try {
      await addEmployee({
        full_name:                newAcc.name,
        email:                    newAcc.email,
        branch_id:                newAcc.branchId,
        contact_number:           newAcc.contactNo,
        address:                  newAcc.address,
        employee_shift:           newAcc.shift,
        employee_role:            newAcc.role,
        employee_profile_picture: newAcc.profilePicture ?? "",
      });
      setIsCreateModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleUpdateAccount = async (updatedAcc) => {
    try {
      // Profile fields (name, branch, contact, etc.)
      await updateProfile(updatedAcc._numId, {
        full_name:                updatedAcc.name,
        branch_id:                updatedAcc.branchId,
        contact_number:           updatedAcc.contactNo,
        address:                  updatedAcc.address,
        employee_shift:           updatedAcc.shift,
        employee_profile_picture: updatedAcc.profilePicture ?? "",
      });

      // Auth fields only if the modal has them (role/status change)
      if (updatedAcc.role || updatedAcc.status) {
        await updateAuth(updatedAcc._numId, {
          email:           updatedAcc.email,
          employee_role:   updatedAcc.role,
          password_status: updatedAcc.passwordStatus ?? "active",
        });
      }

      setIsEditModalOpen(false);
      fetchAccounts();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <h1 className="text-[32px] font-bold text-custom-black mb-1 tracking-tight leading-none">
        Manage Accounts
      </h1>
      <p className="text-custom-gray text-sm mb-8">
        Manage, create, and modify accounts of each user
      </p>

      {/* ── TOP CONTROLS ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target ? e.target.value : e)}
          />
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            filterSelections={[
              { key: "role",   label: "Filter: Role",   options: ["All Roles",   "Staff", "Manager"] },
              { key: "status", label: "Filter: Status", options: ["All Status",  "Active", "Inactive"] },
            ]}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsArchiveModalOpen(true)}
            className="border-custom-gray-2 text-custom-gray hover:text-custom-black gap-2"
          >
            <ArchiveRestore size={15} />
            View Archives
          </Button>

          <Button
            variant="outline"
            onClick={fetchAccounts}
            disabled={isLoading}
            className="border-custom-gray-2 text-custom-gray hover:text-custom-black"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </Button>

          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <span className="text-xl leading-none">+</span> Create New Account
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-custom-black mb-6">Accounts List</h2>

      {/* ── ERROR BANNER ────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-custom-red">
          {error} —{" "}
          <button onClick={fetchAccounts} className="underline">retry</button>
        </div>
      )}

      {/* ── TABLE ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden min-h-112.5">
        <table className="w-full text-sm text-left text-custom-gray">
          <thead className="text-[12px] text-custom-gray uppercase bg-transparent border-b border-custom-gray-2">
            <tr>
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium">Date Created</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-custom-gray italic">
                  Loading accounts…
                </td>
              </tr>
            ) : currentAccounts.length > 0 ? (
              currentAccounts.map((user, index) => (
                <tr
                  key={user.id}
                  className={index % 2 === 0 ? "bg-custom-primary/30" : "bg-white"}
                >
                  <td className="px-4 py-4 text-custom-black">{user.id}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4 text-custom-black">{user.name}</td>
                  <td className="px-4 py-4">{user.role}</td>
                  <td className="px-4 py-4">{user.branch}</td>
                  <td className="px-4 py-4">{user.date}</td>
                  <td className="px-4 py-4">
                    <span className={`font-medium ${
                      user.status === "active" ? "text-custom-green" : "text-custom-gray"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => { setSelectedAccount(user); setIsInfoModalOpen(true); }}
                    >
                      ••• View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-custom-gray italic">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ──────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center mt-auto pt-6 text-sm text-custom-gray">
        <p>
          Showing{" "}
          {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          {" "}to {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length} entries
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className={`text-2xl transition-colors ${
              currentPage === 1 ? "text-custom-gray-2 cursor-not-allowed" : "text-custom-gray hover:text-custom-black"
            }`}
          >
            ‹
          </button>
          <span className="font-medium">{currentPage} / {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`text-2xl transition-colors ${
              currentPage === totalPages || totalPages === 0
                ? "text-custom-gray-2 cursor-not-allowed"
                : "text-custom-gray hover:text-custom-black"
            }`}
          >
            ›
          </button>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewAccount}
      />
      <AccountInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        account={selectedAccount}
        onEdit={() => { setIsInfoModalOpen(false); setIsEditModalOpen(true); }}
      />
      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        account={selectedAccount}
        onSave={handleUpdateAccount}
      />
      <ArchiveAccountsModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />
    </div>
  );
};

export default ManageAccountsPage;
