import { AlertTriangle, ArchiveRestore, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArchivedAccounts, restoreAccount } from "../../../services/ArchiveService";

/*
  ArchiveAccountsModal
  ─────────────────────────────────────────────────────────────────────────────
  PURPOSE:
    Shows all archived accounts and lets an admin "restore" (rollback) any of
    them back to active status.

  HOW IT CONNECTS TO THE BACKEND:
    GET  /api/archiving/displayAllAccounts   → loads the archive list on open
    PUT  /api/archiving/restoreAccount/{id}  → restores one account by its
                                               account_archive_id

  PROPS:
    isOpen   — boolean, controls whether the modal renders
    onClose  — callback to close the modal

  DATA SHAPE (from GET /api/archiving/displayAllAccounts):
    [
      {
        account_archive_id:         3,
        account_archive_display_id: "EM_ARC-003",
        employee_display_id:        "EM-005",
        email:                      "jdoe@gmail.com",
        employee_role:              "Staff",
        branch_id:                  1,
        archived_by:                "EM-001",
        date_archived:              "2025-04-01T10:30:00Z"
      },
      ...
    ]
  ─────────────────────────────────────────────────────────────────────────────
*/
const ArchiveAccountsModal = ({ isOpen, onClose }) => {
  // The list of archived accounts fetched from the API
  const [archives, setArchives] = useState([]);

  // Controls the main loading state (while fetching the list)
  const [isFetching, setIsFetching] = useState(false);

  // Tracks which archive row is currently being restored
  // (null = none, otherwise = the account_archive_id being processed)
  const [restoringId, setRestoringId] = useState(null);

  // Which row the user has clicked "Restore" on — shows inline confirmation
  const [confirmId, setConfirmId] = useState(null);

  // Feedback message shown at the top of the modal after a restore
  const [feedback, setFeedback] = useState(null); // { type: "success"|"error", message: "" }

  // ── Fetch archive list whenever the modal opens ──────────────────────────
  // This is a "side effect" — useEffect runs after the component renders.
  // The [isOpen] dependency array means: "re-run this effect when isOpen changes".
  useEffect(() => {
    if (!isOpen) return; // do nothing when modal is closed

    const fetchArchives = async () => {
      setIsFetching(true);
      setFeedback(null);
      try {
        const data = await getArchivedAccounts();
        setArchives(data);
      } catch (err) {
        setFeedback({ type: "error", message: err.message });
      } finally {
        setIsFetching(false);
      }
    };

    fetchArchives();
  }, [isOpen]);

  // ── Restore handler ──────────────────────────────────────────────────────
  // Called when the user confirms the restore on a specific row.
  // Uses the account_archive_id (the PK of the archive table, NOT employee_id).
  const handleRestore = async (archiveId) => {
    setRestoringId(archiveId);
    setConfirmId(null);

    try {
      const result = await restoreAccount(archiveId);

      // Remove the restored row from the local list immediately (optimistic UI)
      // instead of re-fetching — this gives instant visual feedback.
      setArchives((prev) =>
        prev.filter((a) => a.account_archive_id !== archiveId)
      );

      setFeedback({ type: "success", message: result.message });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setRestoringId(null);
    }
  };

  // ── Guard: don't render when closed ─────────────────────────────────────
  if (!isOpen) return null;

  return (
    /*
      Backdrop overlay — fixed, covers the whole viewport, semi-transparent black.
      animate-fade-in comes from tw-animate-css (already imported in index.css).
    */
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fade-in p-4">

      {/*
        Modal panel.
        max-w-4xl is wider than normal modals because we're showing a data table.
        max-h-[90vh] + overflow-y-auto lets it scroll if there are many archived rows.
      */}
      <div className="bg-custom-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-custom-white border-b border-custom-gray-2 px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {/* ArchiveRestore icon from lucide-react — visually communicates restore */}
            <ArchiveRestore size={22} className="text-custom-blue" />
            <div>
              <h2 className="text-xl font-bold text-custom-black leading-none">
                Archived Accounts
              </h2>
              <p className="text-custom-gray text-xs mt-1">
                Restore accounts to make them active again
              </p>
            </div>
          </div>

          {/* Close button — top-right corner, accessible */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-custom-gray hover:text-custom-black transition-colors rounded-full p-1 hover:bg-custom-gray-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6">

          {/* ── FEEDBACK BANNER ──────────────────────────────────────────── */}
          {/*
            Conditionally renders a green (success) or red (error) banner.
            The feedback state is set by handleRestore and the fetch effect.
          */}
          {feedback && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-green-50 text-custom-green border border-green-200"
                  : "bg-red-50 text-custom-red border border-red-200"
              }`}
            >
              {feedback.type === "success" ? "✓" : "✕"} {feedback.message}
            </div>
          )}

          {/* ── LOADING STATE ─────────────────────────────────────────────── */}
          {isFetching && (
            <div className="flex items-center justify-center py-16 gap-3 text-custom-gray">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading archives...</span>
            </div>
          )}

          {/* ── EMPTY STATE ───────────────────────────────────────────────── */}
          {!isFetching && archives.length === 0 && !feedback && (
            <div className="text-center py-16 text-custom-gray">
              <ArchiveRestore size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No archived accounts</p>
              <p className="text-xs mt-1">Archived accounts will appear here</p>
            </div>
          )}

          {/* ── ARCHIVE TABLE ─────────────────────────────────────────────── */}
          {!isFetching && archives.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">

                <thead className="text-[11px] text-custom-gray uppercase border-b border-custom-gray-2">
                  <tr>
                    <th className="px-3 py-3 font-medium">Archive ID</th>
                    <th className="px-3 py-3 font-medium">Employee ID</th>
                    <th className="px-3 py-3 font-medium">Email</th>
                    <th className="px-3 py-3 font-medium">Role</th>
                    <th className="px-3 py-3 font-medium">Branch</th>
                    <th className="px-3 py-3 font-medium">Archived By</th>
                    <th className="px-3 py-3 font-medium">Date Archived</th>
                    <th className="px-3 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {archives.map((archive, index) => {
                    // Is THIS specific row currently being restored?
                    const isRestoring = restoringId === archive.account_archive_id;
                    // Is THIS row in the "confirm?" state?
                    const isConfirming = confirmId === archive.account_archive_id;

                    // Format branch_id → "BR-001" pattern (matches the DB generated column)
                    const branchDisplay = archive.branch_id
                      ? `BR-${String(archive.branch_id).padStart(3, "0")}`
                      : "—";

                    // Format date to a readable local string
                    const dateStr = archive.date_archived
                      ? new Date(archive.date_archived).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    return (
                      <tr
                        key={archive.account_archive_id}
                        // Alternating row background — same pattern as ManageAccountsPage
                        className={`transition-opacity duration-300 ${
                          isRestoring ? "opacity-40" : ""
                        } ${index % 2 === 0 ? "bg-custom-primary/20" : "bg-white"}`}
                      >
                        <td className="px-3 py-3 text-custom-gray text-xs">
                          {archive.account_archive_display_id}
                        </td>
                        <td className="px-3 py-3 font-medium text-custom-black">
                          {archive.employee_display_id}
                        </td>
                        <td className="px-3 py-3 text-custom-gray">
                          {archive.email}
                        </td>
                        <td className="px-3 py-3">
                          {/*
                            Badge from shadcn — "outline" variant keeps it lightweight.
                            We switch colors based on role.
                          */}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              archive.employee_role === "admin"
                                ? "border-custom-purple text-custom-purple"
                                : archive.employee_role === "manager"
                                ? "border-custom-blue text-custom-blue"
                                : "border-custom-gray text-custom-gray"
                            }`}
                          >
                            {archive.employee_role}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-custom-gray">{branchDisplay}</td>
                        <td className="px-3 py-3 text-custom-gray">{archive.archived_by}</td>
                        <td className="px-3 py-3 text-custom-gray">{dateStr}</td>

                        {/* ── ACTION CELL ─────────────────────────────────── */}
                        <td className="px-3 py-3 text-center">
                          {isRestoring ? (
                            // Spinner shown while this specific row is being restored
                            <Loader2 size={16} className="animate-spin text-custom-gray mx-auto" />

                          ) : isConfirming ? (
                            // Inline confirmation — avoids a second nested modal
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs text-custom-gray whitespace-nowrap">
                                Restore?
                              </span>
                              <button
                                onClick={() => handleRestore(archive.account_archive_id)}
                                className="text-xs px-2 py-1 bg-custom-green text-white rounded-md hover:opacity-90 transition-opacity"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="text-xs px-2 py-1 bg-custom-gray-2 text-custom-black rounded-md hover:opacity-90 transition-opacity"
                              >
                                No
                              </button>
                            </div>

                          ) : (
                            // Default: the Restore button
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmId(archive.account_archive_id)}
                              className="text-xs border-custom-blue text-custom-blue hover:bg-blue-50 gap-1"
                            >
                              <ArchiveRestore size={12} />
                              Restore
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-custom-white border-t border-custom-gray-2 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-custom-yellow">
            <AlertTriangle size={14} />
            <span>Restoring an account gives the employee access to the system again</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="text-custom-gray">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAccountsModal;
