"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, Plus, Edit2, Trash2, Save, Loader2, X } from "lucide-react";

interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  _count: { users: number; computers: number; repairs: number };
}

const initialForm = { code: "", name: "", description: "" };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (dept: DepartmentItem) => {
    setEditId(dept.id);
    setForm({ code: dept.code, name: dept.name, description: dept.description || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editId ? `/api/departments/${editId}` : "/api/departments";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "เกิดข้อผิดพลาด"); return; }
      setShowModal(false);
      fetchDepartments();
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      if (res.ok) fetchDepartments();
      else { const data = await res.json(); alert(data.error); }
    } catch { alert("เกิดข้อผิดพลาด"); }
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
              <Building2 size={24} className="text-[#0866FF]" /> Department Management
            </h1>
            <p className="text-sm text-[#65676B] mt-1">จัดการหน่วยงาน {departments.length} หน่วยงาน</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3]">
            <Plus size={18} /> Add Department
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Description</th>
                  <th className="text-center py-3 px-4 font-medium text-[#65676B]">Users</th>
                  <th className="text-center py-3 px-4 font-medium text-[#65676B]">Computers</th>
                  <th className="text-center py-3 px-4 font-medium text-[#65676B]">Repairs</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-4 bg-[#E4E6EB] rounded animate-pulse" /></td></tr>
                  ))
                ) : departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-[#F0F2F5]">
                    <td className="py-3 px-4 font-medium text-[#1C1E21]">{dept.code}</td>
                    <td className="py-3 px-4 text-[#1C1E21]">{dept.name}</td>
                    <td className="py-3 px-4 text-[#65676B] text-xs max-w-[200px] truncate">{dept.description || "-"}</td>
                    <td className="py-3 px-4 text-center text-[#1C1E21]">{dept._count.users}</td>
                    <td className="py-3 px-4 text-center text-[#1C1E21]">{dept._count.computers}</td>
                    <td className="py-3 px-4 text-center text-[#1C1E21]">{dept._count.repairs}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(dept)} className="p-1.5 text-[#65676B] hover:text-[#FB923C] hover:bg-[#FFF3E0] rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteId(dept.id)} className="p-1.5 text-[#65676B] hover:text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-[#DADDE1]">
              <h3 className="text-lg font-semibold text-[#1C1E21]">{editId ? "Edit Department" : "Add Department"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#65676B] hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E]">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Code *</label>
                <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#DADDE1]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">ยกเลิก</button>
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-[#65676B] mb-6">คุณต้องการลบหน่วยงานนี้ใช่หรือไม่?</p>
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
