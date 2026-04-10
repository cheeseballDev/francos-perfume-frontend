import DataTable from "@/components/data_components/DataTable";
import { Button } from "@/components/ui/button";
import { ArchiveRestore, Edit, Minus, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AddProductModal from "../../components/features/inventory_components/AddProductModal";
import ArchiveProductsModal from "../../components/features/inventory_components/ArchiveProductsModal";
import EditProductModal from "../../components/features/inventory_components/EditProductModal";
import FilterBar from "../../components/shared/FilterDropDown";
import SearchBar from "../../components/shared/SearchBar";
import { getInventory, updateQuantity } from "../../services/InventoryService";
import { addProduct, updateProduct } from "../../services/ProductService";

/*
  InventoryPage
  ─────────────────────────────────────────────────────────────────────────────
  DATA FLOW:
    Mount / refresh → getInventory() → GET /api/inventory/displayAll
    The server filters by the JWT branch_id, so each user only sees their branch.

  API ROW SHAPE (InventoryDisplayDTO):
    {
      productId, productDisplayId, productName, productType,
      productNote, productGender, productDateCreated, productBarcode,
      productStatus, quantity, branchDisplayId
    }

  LOCAL → API FIELD MAPPING:
    The columns array and filter logic use shorthand keys (id, name, qty…)
    that are mapped from the API shape in normalizeRow() below.
    This keeps the existing DataTable columns unchanged.
  ─────────────────────────────────────────────────────────────────────────────
*/

// Maps the API's camelCase DTO fields to the short keys the table columns use
const normalizeRow = (item) => ({
  id:      item.productDisplayId,
  _numId:  item.productId,        // numeric id kept for API calls, hidden from table
  name:    item.productName,
  type:    item.productType,
  note:    item.productNote   ?? "—",
  gender:  item.productGender ?? "—",
  date:    item.productDateCreated
             ? new Date(item.productDateCreated).toLocaleDateString("en-PH")
             : "—",
  qty:     item.quantity,
  branch:  item.branchDisplayId  ?? "—",
  barcode: item.productBarcode   ?? "—",
  status:  item.productStatus,
});

const filterSelections = [
  { key: "type",   label: "Perfume Type", options: ["All Perfume Types", "Premium", "Classic"] },
  { key: "branch", label: "Branch",       options: ["All Branches", "Sta. Lucia", "Riverbanks"] },
  { key: "gender", label: "Gender",       options: ["All Genders", "Unisex", "Male", "Female"] },
];

const Inventory = ({ role }) => {
  const isManager = role === "manager";

  const [inventory, setInventory]           = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [filters, setFilters]               = useState({
    type: "All Perfume Types", branch: "All Branches", gender: "All Genders",
  });

  const [isEditModalOpen, setIsEditModalOpen]       = useState(false);
  const [editingProduct, setEditingProduct]         = useState(null);
  const [isAddModalOpen, setIsAddModalOpen]         = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // ── Fetch inventory ──────────────────────────────────────────────────────
  // useCallback so the function reference is stable — safe to add to useEffect deps
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventory();
      setInventory(data.map(normalizeRow));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ── Qty buttons ──────────────────────────────────────────────────────────
  // Optimistic update: change local state immediately, then call the API.
  // If the API fails, revert to the original value.
  const handleQtyChange = async (displayId, delta) => {
    const original = inventory.find((i) => i.id === displayId);
    if (!original) return;

    // Optimistic: update locally first so the UI feels instant
    setInventory((prev) =>
      prev.map((i) =>
        i.id === displayId
          ? { ...i, qty: Math.max(0, i.qty + delta) }
          : i
      )
    );

    try {
      // delta here is the amount to ADD (negative to decrease)
      await updateQuantity(original._numId, delta);
    } catch (err) {
      // Revert on failure
      setInventory((prev) =>
        prev.map((i) => (i.id === displayId ? original : i))
      );
      alert(`Could not update quantity: ${err.message}`);
    }
  };

  // ── Edit modal ───────────────────────────────────────────────────────────
  const handleOpenEditModal = (displayId) => {
    setEditingProduct(inventory.find((i) => i.id === displayId));
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct._numId, {
        product_name:         updatedProduct.name,
        product_type:         updatedProduct.type,
        product_note:         updatedProduct.note,
        product_gender:       updatedProduct.gender,
        product_barcode:      updatedProduct.barcode,
        product_status:       updatedProduct.status,
        product_description:  updatedProduct.description ?? "",
        product_date_created: updatedProduct.date,
      });
      setIsEditModalOpen(false);
      fetchInventory(); // re-fetch to stay in sync
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  // ── Add modal ────────────────────────────────────────────────────────────
  const handleAddProduct = async (newProduct) => {
    try {
      await addProduct({
        product_name:        newProduct.name,
        product_type:        newProduct.type,
        product_note:        newProduct.note,
        product_gender:      newProduct.gender,
        product_barcode:     newProduct.barcode,
        product_description: newProduct.description ?? "",
      });
      setIsAddModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(`Add failed: ${err.message}`);
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    { header: "ID",           accessorKey: "id",     enableSorting: true },
    { header: "Perfume Name", accessorKey: "name",   sortingFn: "alphanumeric" },
    { header: "Type",         accessorKey: "type",   sortingFn: "alphanumeric" },
    { header: "Branch",       accessorKey: "branch", sortingFn: "alphanumeric" },
    { header: "Note",         accessorKey: "note",   sortingFn: "alphanumeric" },
    { header: "Gender",       accessorKey: "gender", sortingFn: "alphanumeric" },
    { header: "Date Created", accessorKey: "date",   sortingFn: "datetime" },
    { header: "Quantity",     accessorKey: "qty",    sortingFn: "basic" },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-1">
            <Button variant="primary" size="icon-sm" onClick={() => handleQtyChange(item.id, +1)}>
              <Plus size={14} />
            </Button>
            <Button variant="primary" size="icon-sm" onClick={() => handleQtyChange(item.id, -1)}>
              <Minus size={14} />
            </Button>
            <Button variant="primary" size="icon-sm" onClick={() => handleOpenEditModal(item.id)}>
              <Edit size={14} />
            </Button>
          </div>
        );
      },
    },
  ];

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType   = filters.type   === "All Perfume Types" || item.type   === filters.type;
    const matchesBranch = filters.branch === "All Branches"      || item.branch === filters.branch;
    const matchesGender = filters.gender === "All Genders"       || item.gender === filters.gender;
    return matchesSearch && matchesType && matchesBranch && matchesGender;
  });

  return (
    <div className="flex flex-col h-full animate-fade-in relative">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-custom-black tracking-tight leading-none mb-2">
            Inventory
          </h1>
          <p className="text-custom-gray text-sm">Overview of all available parfum products</p>
        </div>

        <div className="flex gap-3">
          <Button variant="primary">
            <span className="text-lg">▤</span> Scan barcode
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsArchiveModalOpen(true)}
            className="border-custom-gray-2 text-custom-gray hover:text-custom-black gap-2"
          >
            <ArchiveRestore size={15} />
            View Archives
          </Button>

          {/* Refresh — re-fetches from API */}
          <Button
            variant="outline"
            onClick={fetchInventory}
            disabled={isLoading}
            className="border-custom-gray-2 text-custom-gray hover:text-custom-black gap-2"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </Button>

          {isManager && (
            <Button variant="success" onClick={() => setIsAddModalOpen(true)}>
              + ADD PRODUCT
            </Button>
          )}
        </div>
      </div>

      {/* ── SEARCH + FILTER ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={(v) => setSearchQuery(v?.target ? v.target.value : v)}
        />
        <FilterBar filters={filters} setFilters={setFilters} filterSelections={filterSelections} />
      </div>

      {/* ── ERROR BANNER ────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-custom-red">
          {error} —{" "}
          <button onClick={fetchInventory} className="underline">retry</button>
        </div>
      )}

      {/* ── TABLE ───────────────────────────────────────────────────────── */}
      <DataTable data={filteredInventory} columns={columns} />

      {/* Pagination is handled inside DataTable */}

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveEdit}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
      />

      <ArchiveProductsModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />
    </div>
  );
};

export default Inventory;
