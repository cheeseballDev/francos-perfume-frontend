import { ArchiveRestore, Loader2, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArchivedProducts, restoreProduct } from "../../../services/ArchiveService";

/*
  ArchiveProductsModal
  ─────────────────────────────────────────────────────────────────────────────
  PURPOSE:
    Shows all archived products and lets a manager restore them back to
    "active" status so they appear in the inventory again.

  HOW IT CONNECTS TO THE BACKEND:
    GET  /api/archiving/displayAllProducts   → loads the archive list on open
    PUT  /api/archiving/restoreProduct/{id}  → restores one product by its
                                               product_archive_id

  DATA SHAPE (from GET /api/archiving/displayAllProducts):
    [
      {
        product_archive_id:          2,
        product_archive_display_id:  "PROD_ARC-002",
        product_id:                  3,
        product_display_id:          "PROD-003",
        product_name:                "Midnight Wood",
        product_type:                "Premium",
        product_note:                "Karat",
        product_gender:              "Male",
        product_barcode:             "123456789",
        archived_by:                 "EM-001",
        date_archived:               "2025-03-15T08:00:00Z"
      },
      ...
    ]

  DESIGN NOTES:
    - Same interaction pattern as ArchiveAccountsModal (inline confirm, spinner)
    - Wider table to accommodate product details
    - Gender badge uses custom-purple / custom-blue / custom-green color scheme
  ─────────────────────────────────────────────────────────────────────────────
*/
const ArchiveProductsModal = ({ isOpen, onClose }) => {
  const [archives, setArchives]     = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [feedback, setFeedback]     = useState(null);

  // ── Fetch on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const fetchArchives = async () => {
      setIsFetching(true);
      setFeedback(null);
      try {
        const data = await getArchivedProducts();
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
  const handleRestore = async (archiveId) => {
    setRestoringId(archiveId);
    setConfirmId(null);
    try {
      const result = await restoreProduct(archiveId);
      // Optimistic removal — removes the row instantly without re-fetching
      setArchives((prev) =>
        prev.filter((a) => a.product_archive_id !== archiveId)
      );
      setFeedback({ type: "success", message: result.message });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setRestoringId(null);
    }
  };

  // Helper: pick a color for the gender badge
  const genderColor = (gender) => {
    if (!gender) return "border-custom-gray text-custom-gray";
    switch (gender.toLowerCase()) {
      case "male":   return "border-custom-blue text-custom-blue";
      case "female": return "border-custom-purple text-custom-purple";
      default:       return "border-custom-green text-custom-green"; // Unisex
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-fade-in p-4">
      <div className="bg-custom-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-custom-white border-b border-custom-gray-2 px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Package size={22} className="text-custom-purple" />
            <div>
              <h2 className="text-xl font-bold text-custom-black leading-none">
                Archived Products
              </h2>
              <p className="text-custom-gray text-xs mt-1">
                Restore products to make them active in inventory again
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-custom-gray hover:text-custom-black transition-colors rounded-full p-1 hover:bg-custom-gray-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6">

          {/* ── FEEDBACK BANNER ──────────────────────────────────────────── */}
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
              <span className="text-sm">Loading product archives...</span>
            </div>
          )}

          {/* ── EMPTY STATE ───────────────────────────────────────────────── */}
          {!isFetching && archives.length === 0 && !feedback && (
            <div className="text-center py-16 text-custom-gray">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No archived products</p>
              <p className="text-xs mt-1">Archived products will appear here</p>
            </div>
          )}

          {/* ── PRODUCTS TABLE ────────────────────────────────────────────── */}
          {!isFetching && archives.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">

                <thead className="text-[11px] text-custom-gray uppercase border-b border-custom-gray-2">
                  <tr>
                    <th className="px-3 py-3 font-medium">Archive ID</th>
                    <th className="px-3 py-3 font-medium">Product ID</th>
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Type</th>
                    <th className="px-3 py-3 font-medium">Note</th>
                    <th className="px-3 py-3 font-medium">Gender</th>
                    <th className="px-3 py-3 font-medium">Archived By</th>
                    <th className="px-3 py-3 font-medium">Date Archived</th>
                    <th className="px-3 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {archives.map((archive, index) => {
                    const isRestoring  = restoringId === archive.product_archive_id;
                    const isConfirming = confirmId   === archive.product_archive_id;

                    const dateStr = archive.date_archived
                      ? new Date(archive.date_archived).toLocaleDateString("en-PH", {
                          year: "numeric", month: "short", day: "numeric",
                        })
                      : "—";

                    return (
                      <tr
                        key={archive.product_archive_id}
                        className={`transition-opacity duration-300 ${
                          isRestoring ? "opacity-40" : ""
                        } ${index % 2 === 0 ? "bg-custom-primary/20" : "bg-white"}`}
                      >
                        <td className="px-3 py-3 text-custom-gray text-xs">
                          {archive.product_archive_display_id}
                        </td>
                        <td className="px-3 py-3 font-medium text-custom-black">
                          {archive.product_display_id}
                        </td>
                        <td className="px-3 py-3 font-semibold text-custom-black">
                          {archive.product_name}
                        </td>
                        <td className="px-3 py-3 text-custom-gray">
                          {archive.product_type}
                        </td>
                        <td className="px-3 py-3 text-custom-gray">
                          {archive.product_note || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${genderColor(archive.product_gender)}`}
                          >
                            {archive.product_gender || "—"}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-custom-gray">{archive.archived_by}</td>
                        <td className="px-3 py-3 text-custom-gray">{dateStr}</td>

                        <td className="px-3 py-3 text-center">
                          {isRestoring ? (
                            <Loader2 size={16} className="animate-spin text-custom-gray mx-auto" />
                          ) : isConfirming ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-xs text-custom-gray whitespace-nowrap">Restore?</span>
                              <button
                                onClick={() => handleRestore(archive.product_archive_id)}
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmId(archive.product_archive_id)}
                              className="text-xs border-custom-purple text-custom-purple hover:bg-purple-50 gap-1"
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
        <div className="sticky bottom-0 bg-custom-white border-t border-custom-gray-2 px-8 py-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-custom-gray">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveProductsModal;
