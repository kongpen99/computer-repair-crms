"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Package, Search, Plus, Edit2, Trash2, AlertTriangle, Save, Loader2, X } from "lucide-react";

interface PartItem {
  id: string;
  partCode: string;
  name: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  stock: number;
  minimumStock: number;
  unit: string | null;
  price: number;
  supplier: string | null;
  remark: string | null;
}

const initialForm = {
  partCode: "", name: "", category: "", brand: "", model: "",
  stock: "0", minimumStock: "0", unit: "", price: "0", supplier: "", remark: "",
};

export default function PartsPage() {
  const [parts, setParts] = useState<PartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), pageSize: "10", search });
    try {
      const res = await fetch(`/api/parts?${params}`);
      const data = await res.json();
      setParts(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (part: PartItem) => {
    setEditId(part.id);
    setForm({
      partCode: part.partCode, name: part.name, category: part.category || "",
      brand: part.brand || "", model: part.model || "",
      stock: part.stock.toString(), minimumStock: part.minimumStock.toString(),
      unit: part.unit || "", price: part.price.toString(),
      supplier: part.supplier || "", remark: part.remark || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editId ? `/api/parts/${editId}` : "/api/parts";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }
      setShowModal(false);
      fetchParts();
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/parts/${id}`, { method: "DELETE" });
      if (res.ok) fetchParts();
      else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
              <Package size={24} className="text-[#0866FF]" />
              Spare Parts
            </h1>
            <p className="text-sm text-[#65676B] mt-1">จัดการอะไหล่ทั้งหมด {total} รายการ</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3]">
            <Plus size={18} /> Add Part
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] p-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
            <input type="text" placeholder="ค้นหา Part Code, Name, Brand..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Part Code</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Brand/Model</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Min Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}><td colSpan={8} className="py-4 px-4"><div className="h-4 bg-[#E4E6EB] rounded animate-pulse" /></td></tr>
                  ))
                ) : parts.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-[#65676B]">
                    <Package size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>ไม่พบข้อมูลอะไหล่</p>
                  </td></tr>
                ) : parts.map((part) => (
                  <tr key={part.id} className="hover:bg-[#F0F2F5]">
                    <td className="py-3 px-4 font-medium text-[#1C1E21]">{part.partCode}</td>
                    <td className="py-3 px-4 text-[#1C1E21]">{part.name}</td>
                    <td className="py-3 px-4 text-[#1C1E21]">{part.brand || "-"} {part.model || ""}</td>
                    <td className="py-3 px-4 text-[#65676B] text-xs">{part.category || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${part.stock <= part.minimumStock && part.stock > 0 ? "text-[#FA3E3E]" : part.stock === 0 ? "text-red-500" : "text-[#1C1E21]"}`}>
                        {part.stock}
                      </span>
                      {part.stock <= part.minimumStock && part.stock > 0 && (
                        <AlertTriangle size={14} className="inline ml-1 text-yellow-500" />
                      )}
                      {part.stock === 0 && (
                        <AlertTriangle size={14} className="inline ml-1 text-red-500" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-[#65676B]">{part.minimumStock}</td>
                    <td className="py-3 px-4 text-right text-[#1C1E21]">{new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(part.price)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(part)}
                          className="p-1.5 text-[#65676B] hover:text-[#FB923C] hover:bg-[#FFF3E0] rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteId(part.id)}
                          className="p-1.5 text-[#65676B] hover:text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#DADDE1]">
              <p className="text-sm text-[#65676B]">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5] disabled:opacity-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5] disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#DADDE1]">
              <h3 className="text-lg font-semibold text-[#1C1E21]">
                {editId ? "Edit Part" : "Add Part"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#65676B] hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E]">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Part Code *</label>
                  <input value={form.partCode} onChange={(e) => setForm((p) => ({ ...p, partCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Category</label>
                  <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Model</label>
                  <input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Minimum Stock</label>
                  <input type="number" value={form.minimumStock} onChange={(e) => setForm((p) => ({ ...p, minimumStock: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Unit</label>
                  <input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="ชิ้น, กล่อง..." className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Price (฿)</label>
                  <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Supplier</label>
                  <input value={form.supplier} onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Remark</label>
                <textarea value={form.remark} onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DADDE1]">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">ยกเลิก</button>
                <button type="submit" disabled={formLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] disabled:opacity-50">
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editId ? "บันทึก" : "เพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-[#65676B] mb-6">คุณต้องการลบอะไหล่นี้ใช่หรือไม่?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">ยกเลิก</button>
              <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-[#FA3E3E] text-white rounded-lg hover:bg-[#E03333]">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
