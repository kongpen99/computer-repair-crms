"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Plus, Edit2, Trash2, Save, Loader2, X } from "lucide-react";
import { getRoleLabel } from "@/lib/utils";

interface UserItem {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  departmentId: string | null;
  department?: { name: string } | null;
  _count?: { assignedRepairs: number };
}

interface DepartmentOption {
  id: string;
  name: string;
}

const initialForm = {
  username: "", email: "", password: "", name: "", role: "TECHNICIAN", departmentId: "", isActive: "true",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetch("/api/departments")
      .then((r) => r.json())
      .then((json) => setDepartments(json.data || []))
      .catch(console.error);
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (user: UserItem) => {
    setEditId(user.id);
    setForm({
      username: user.username, email: user.email, password: "",
      name: user.name, role: user.role,
      departmentId: user.departmentId || "", isActive: user.isActive.toString(),
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editId ? `/api/users/${editId}` : "/api/users";
      const method = editId ? "PUT" : "POST";
      const body = { ...form, isActive: form.isActive === "true" };
      if (editId && !body.password) delete (body as Record<string, unknown>).password;

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }
      setShowModal(false);
      fetchUsers();
    } catch {
      setError("เกิดข้อผิดพลาด");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
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
              <Users size={24} className="text-[#0866FF]" /> User Management
            </h1>
            <p className="text-sm text-[#65676B] mt-1">จัดการผู้ใช้งานระบบ {users.length} คน</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3]">
            <Plus size={18} /> Add User
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Repairs</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan={8} className="py-4 px-4"><div className="h-4 bg-[#E4E6EB] rounded animate-pulse" /></td></tr>
                  ))
                ) : users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F0F2F5]">
                    <td className="py-3 px-4 font-medium text-[#1C1E21]">{user.username}</td>
                    <td className="py-3 px-4 text-[#1C1E21]">{user.name}</td>
                    <td className="py-3 px-4 text-[#65676B] text-xs">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#1C1E21] text-xs">{user.department?.name || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block w-2 h-2 rounded-full ${user.isActive ? "bg-[#E8F5E9]0" : "bg-[#FDEDEF]0"}`} />
                      <span className="ml-1 text-xs text-[#65676B]">{user.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="py-3 px-4 text-[#65676B] text-center">{user._count?.assignedRepairs || 0}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(user)} className="p-1.5 text-[#65676B] hover:text-[#FB923C] hover:bg-[#FFF3E0] rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteId(user.id)} className="p-1.5 text-[#65676B] hover:text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-[#DADDE1]">
              <h3 className="text-lg font-semibold text-[#1C1E21]">{editId ? "Edit User" : "Add User"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#65676B] hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E]">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Username *</label>
                  <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Password {!editId && "*"}</label>
                  <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder={editId ? "Leave blank to keep current" : ""}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                    required={!editId} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                    <option value="ADMIN">Admin</option>
                    <option value="TECHNICIAN">Technician</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Department</label>
                  <select value={form.departmentId} onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                    <option value="">Select Department</option>
                    {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
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

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-[#65676B] mb-6">คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?</p>
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
