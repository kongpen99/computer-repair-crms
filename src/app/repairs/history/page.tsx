"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { getStatusLabel, getStatusColor, formatDateTime } from "@/lib/utils";
import { History, Search, Eye } from "lucide-react";

interface RepairItem {
  id: string;
  repairNo: string;
  problemDescription: string;
  status: string;
  createdAt: string;
  computer?: { assetCode: string; computerName: string | null } | null;
  technician?: { name: string } | null;
}

export default function RepairHistoryPage() {
  const [repairs, setRepairs] = useState<RepairItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRepairs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: "15",
      search,
      status: statusFilter,
    });
    try {
      const res = await fetch(`/api/repairs?${params}`);
      const data = await res.json();
      setRepairs(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
            <History size={24} className="text-[#0866FF]" />
            Repair History
          </h1>
          <p className="text-sm text-[#65676B] mt-1">ประวัติการซ่อมทั้งหมด {total} รายการ</p>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
              <input
                type="text"
                placeholder="ค้นหา Repair ID, Problem..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
              />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
              <option value="">All Status</option>
              <option value="WAITING">รอดำเนินการ</option>
              <option value="ASSIGNED">มอบหมายงานแล้ว</option>
              <option value="DIAGNOSING">กำลังตรวจสอบ</option>
              <option value="REPAIRING">กำลังซ่อม</option>
              <option value="WAITING_PART">รออะไหล่</option>
              <option value="COMPLETED">ซ่อมเสร็จ</option>
              <option value="RETURNED">ส่งคืนแล้ว</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Repair ID</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Asset Code</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Computer</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Problem</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Technician</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Action</th>
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
                ) : repairs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#65676B]">
                      <History size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>ไม่พบประวัติการซ่อม</p>
                    </td>
                  </tr>
                ) : (
                  repairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-[#F0F2F5]">
                      <td className="py-3 px-4">
                        <Link href={`/repairs/${repair.id}`} className="text-[#0866FF] hover:underline font-medium">
                          {repair.repairNo}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#65676B] text-xs">{formatDateTime(repair.createdAt)}</td>
                      <td className="py-3 px-4 text-[#1C1E21]">{repair.computer?.assetCode || "-"}</td>
                      <td className="py-3 px-4 text-[#1C1E21]">{repair.computer?.computerName || "-"}</td>
                      <td className="py-3 px-4 text-[#1C1E21] max-w-[200px] truncate">{repair.problemDescription}</td>
                      <td className="py-3 px-4 text-[#1C1E21]">{repair.technician?.name || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(repair.status)}`}>
                          {getStatusLabel(repair.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/repairs/${repair.id}`}
                          className="p-1.5 text-[#65676B] hover:text-[#0866FF] hover:bg-[#E7F3FF] rounded-lg inline-flex">
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
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
    </DashboardLayout>
  );
}
