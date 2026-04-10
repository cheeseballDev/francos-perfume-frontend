import { Loader2 } from "lucide-react";
import { useState } from "react";
import { archiveAccount } from "../../../services/ArchiveService";

/*
  AccountInfoModal
  ─────────────────────────────────────────────────────────────────────────────
  Shows full profile details for a selected account, plus four action buttons.

  PROPS:
    isOpen    — controls render
    onClose   — close the modal
    account   — the account object selected in ManageAccountsPage
    onEdit    — callback: close this modal and open EditAccountModal

  ACCOUNT OBJECT SHAPE (from ManageAccountsPage state):
    {
      id:       "001",          ← employee_display_id (or employee_id as int once API is wired)
      email:    "jdoe@gmail.com",
      name:     "Jane Doe",
      role:     "Manager",
      branch:   "Riverbanks",
      date:     "09/10/2025",
      status:   "Active"
    }

  BACKEND ENDPOINTS WIRED HERE:
    PUT  /api/archiving/archiveAccount/{employee_id}   ← Archive Account button
    POST /api/employees/resetPassword/{employee_id}    ← Reset Password (placeholder)

  NOTE ON employee_id vs id:
    The current mock data uses a 3-digit string as `id` ("001", "002"...).
    When the API is connected, the account object will have a numeric `employee_id`
    field. Replace `account.id` with `account.employee_id` in the fetch calls below.
  ─────────────────────────────────────────────────────────────────────────────
*/
const AccountInfoModal = ({ isOpen, onClose, account, onEdit }) => {
  // Tracks which action button is in the "confirm" state
  // Values: null | "archive" | "deactivate" | "resetPassword"
  const [confirming, setConfirming] = useState(null);

  // Tracks which action is currently loading (API call in progress)
  const [loading, setLoading] = useState(null);

  // Feedback after an action completes
  const [feedback, setFeedback] = useState(null); // { type, message }

  // Guard
  if (!isOpen || !account) return null;

  // ── Reset all transient state when the modal is about to close ───────────
  const handleClose = () => {
    setConfirming(null);
    setLoading(null);
    setFeedback(null);
    onClose();
  };

  // ── Archive Account ───────────────────────────────────────────────────────
  // Calls PUT /api/archiving/archiveAccount/{employee_id}
  // The {employee_id} here is the numeric PK — use account.employee_id once API is live.
  const handleArchive = async () => {
    setLoading("archive");
    try {
      // account._numId is the numeric employee_id set by normalizeEmployee() in ManageAccountsPage
      await archiveAccount(account._numId ?? account.id);
      setFeedback({ type: "success", message: `${account.name} has been archived.` });
      setConfirming(null);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
      setConfirming(null);
    } finally {
      setLoading(null);
    }
  };

  // ── Generic action button renderer ────────────────────────────────────────
  // This pattern avoids repeating the confirm/loading/label logic for every button.
  //
  // How it works:
  //   1. Default state: shows the label
  //   2. When clicked: sets confirming = actionKey (shows "Confirm?" text + Yes/No)
  //   3. Yes: fires the handler, sets loading = actionKey (shows spinner)
  //   4. Done: resets confirming and loading, sets feedback
  const ActionButton = ({ actionKey, label, onConfirm, className }) => {
    const isThisConfirming = confirming === actionKey;
    const isThisLoading    = loading    === actionKey;

    if (isThisLoading) {
      return (
        <div className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-sm ${className}`}>
          <Loader2 size={14} className="animate-spin" />
          <span>Processing...</span>
        </div>
      );
    }

    if (isThisConfirming) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-2 rounded-md border border-custom-gray-2 bg-gray-50">
          <p className="text-xs text-custom-gray">Are you sure?</p>
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              className="text-xs px-3 py-1 bg-custom-red text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirming(null)}
              className="text-xs px-3 py-1 bg-custom-gray-2 text-custom-black rounded-md hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={() => setConfirming(actionKey)}
        className={`py-2.5 rounded-md text-sm transition-colors font-medium ${className}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 animate-fade-in font-montserrat">
      <div className="bg-custom-white rounded-2xl shadow-xl w-full max-w-150 p-10 relative">

        {/* NAV BUTTONS */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 text-custom-gray hover:text-custom-black text-xl"
        >
          ‹
        </button>
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-custom-gray hover:text-custom-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-4xl font-extrabold text-custom-black text-center mb-8 tracking-tight">
          Account Information
        </h2>

        {/* ── FEEDBACK BANNER ──────────────────────────────────────────────── */}
        {feedback && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium text-center ${
              feedback.type === "success"
                ? "bg-green-50 text-custom-green border border-green-200"
                : "bg-red-50 text-custom-red border border-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* ── DATA GRID ────────────────────────────────────────────────────── */}
        <div className="space-y-6 px-4">

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-custom-gray font-medium">First name:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">
                {account.firstName || account.name?.split(" ")[0]}
              </p>
            </div>
            <div>
              <p className="text-xs text-custom-gray font-medium">Middle name:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">
                {account.middleName || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-custom-gray font-medium">Last name:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">
                {account.lastName || account.name?.split(" ")[1]}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-custom-gray font-medium">Address:</p>
            <p className="text-sm font-extrabold text-custom-black mt-1 uppercase">
              {account.address || "—"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-custom-gray font-medium">Email:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">{account.email}</p>
            </div>
            <div>
              <p className="text-xs text-custom-gray font-medium">Contact no.:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">
                {account.contactNo || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-custom-gray font-medium">Branch:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">{account.branch}</p>
            </div>
            <div>
              <p className="text-xs text-custom-gray font-medium">Role:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1 uppercase">{account.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-custom-gray font-medium">Date Created:</p>
              <p className="text-sm font-extrabold text-custom-black mt-1">{account.date}</p>
            </div>
            <div>
              <p className="text-xs text-custom-gray font-medium">Status:</p>
              <p className={`text-sm font-extrabold mt-1 ${
                account.status === "Active" ? "text-custom-green" : "text-custom-gray"
              }`}>
                {account.status}
              </p>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ───────────────────────────────────────────────── */}
        {/*
          DESIGN PATTERN:
            - Edit Account: primary action, uses the custom-primary brand color
            - Reset Password, Deactivate, Archive: destructive/sensitive actions,
              use red outline style + inline confirmation before firing the API call
        */}
        <div className="grid grid-cols-2 gap-4 mt-10 px-4">

          {/* Edit — no confirmation needed, just navigates to edit modal */}
          <button
            onClick={onEdit}
            className="bg-custom-primary hover:bg-custom-primary/80 text-custom-black font-medium py-2.5 rounded-md text-sm transition-colors shadow-sm"
          >
            Edit Account
          </button>

          {/* Reset Password — placeholder; wire up your reset endpoint here */}
          <ActionButton
            actionKey="resetPassword"
            label="Reset Password"
            onConfirm={async () => {
              // 🔌 TODO: POST /api/employees/resetPassword/${account.id}
              setLoading("resetPassword");
              setTimeout(() => {
                setFeedback({ type: "success", message: "Password reset link sent to email." });
                setLoading(null);
                setConfirming(null);
              }, 1200);
            }}
            className="border border-custom-red text-custom-red hover:bg-red-50"
          />

          {/* Deactivate — placeholder; wire up your status endpoint */}
          <ActionButton
            actionKey="deactivate"
            label="Deactivate Account"
            onConfirm={async () => {
              // 🔌 TODO: PATCH /api/employees/updateAuth/${account.id} { account_status: "inactive" }
              setLoading("deactivate");
              setTimeout(() => {
                setFeedback({ type: "success", message: "Account deactivated." });
                setLoading(null);
                setConfirming(null);
              }, 1200);
            }}
            className="border border-custom-red text-custom-red hover:bg-red-50"
          />

          {/* Archive — wired to the real ArchivingController */}
          <ActionButton
            actionKey="archive"
            label="Archive Account"
            onConfirm={handleArchive}
            className="border border-custom-red text-custom-red hover:bg-red-50"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountInfoModal;
