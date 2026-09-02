"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { getComputerStatusLabel, getComputerStatusColor, formatDate } from "@/lib/utils";
import { Plus, Search, Monitor, Edit2, Eye, Trash2 } from "lucide-react";
import type { ComputerType, PaginatedResponse } from "@/types/computer";
import type { DepartmentType } from "@/types/user";

export default function ComputerListPage() {
  const [computers, setComputers] = useState<ComputerType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchComputers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "10",
      search,
      status: statusFilter,
      departmentId: deptFilter,
    });

    try {
      const res = await fetch(`/api/computers?${params}`);
      const data: PaginatedResponse<ComputerType> & { totalPages: number } = await res.json();
      setComputers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, deptFilter]);

  useEffect(() => {
    fetchComputers();
  }, [fetchComputers]);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((json) => setDepartments(json.data || []))
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/computers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchComputers();
      } else {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
              <Monitor size={24} className="text-[#0866FF]" />
              Computer Management
            </h1>
            <p className="text-sm text-[#65676B] mt-1">
              รายการ Computer ทั้งหมด {total} เครื่อง
            </p>
          </div>
          <Link
            href="/computers/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] transition-colors"
          >
            <Plus size={18} />
            Add Computer
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#DADDE1] p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
              <input
                type="text"
                placeholder="ค้นหา Asset Code, Serial, Name, IP..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
            >
              <option value="">All Status</option>
              <option value="NORMAL">ปกติ</option>
              <option value="REPAIR">กำลังซ่อม</option>
              <option value="DAMAGED">เสียหาย</option>
              <option value="RETIRED">ปลดระวาง</option>
              <option value="LOST">สูญหาย</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Asset Code</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Computer Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Brand/Model</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">User</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Repairs</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-4 px-4">
                        <div className="h-4 bg-[#E4E6EB] rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : computers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#65676B]">
                      <Monitor size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>ไม่พบข้อมูล Computer</p>
                    </td>
                  </tr>
                ) : (
                  computers.map((computer) => (
                    <tr key={computer.id} className="hover:bg-[#F0F2F5]">
                      <td className="py-3 px-4">
                        <Link
                          href={`/computers/${computer.id}`}
                          className="text-[#0866FF] hover:underline font-medium"
                        >
                          {computer.assetCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#1C1E21]">{computer.computerName || "-"}</td>
                      <td className="py-3 px-4 text-[#1C1E21]">
                        {computer.brand} {computer.model}
                      </td>
                      <td className="py-3 px-4 text-[#1C1E21]">
                        {computer.department?.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-[#1C1E21]">{computer.assignedUser || "-"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getComputerStatusColor(computer.status)}`}
                        >
                          {getComputerStatusLabel(computer.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#65676B] text-center">
                        {computer._count?.repairs || 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/computers/${computer.id}`}
                            className="p-1.5 text-[#65676B] hover:text-[#0866FF] hover:bg-[#E7F3FF] rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/computers/${computer.id}/edit`}
                            className="p-1.5 text-[#65676B] hover:text-[#FB923C] hover:bg-[#FFF3E0] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(computer.id)}
                            className="p-1.5 text-[#65676B] hover:text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#DADDE1]">
              <p className="text-sm text-[#65676B]">
                Page {page} of {totalPages} ({total} items)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-[#65676B] mb-6">
              คุณต้องการลบ Computer นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-[#FA3E3E] text-white rounded-lg hover:bg-[#E03333]"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
