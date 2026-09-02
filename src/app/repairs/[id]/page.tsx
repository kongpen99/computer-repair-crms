"use client";

import { useState, useEffect, useCallback, use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Wrench, Package, User, Edit2, Plus, Loader2 } from "lucide-react";
import {
  getStatusLabel, getStatusColor,
  getProblemTypeLabel, getPriorityLabel, getPriorityColor,
  formatDateTime, formatCurrency,
} from "@/lib/utils";

interface RepairData {
  id: string;
  repairNo: string;
  problemDescription: string;
  problemType: string;
  priority: string;
  status: string;
  requesterName: string;
  location: string | null;
  cost: number | null;
  cause: string | null;
  solution: string | null;
  remark: string | null;
  receivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  returnedAt: string | null;
  createdAt: string;
  computer?: {
    id: string;
    assetCode: string;
    computerName: string | null;
    brand: string | null;
    model: string | null;
  } | null;
  department?: { name: string } | null;
  technician?: { id: string; name: string; email: string } | null;
  histories: {
    id: string;
    status: string;
    description: string | null;
    createdAt: string;
    user?: { name: string } | null;
  }[];
  parts: {
    id: string;
    quantity: number;
    price: number;
    total: number;
    part: { name: string; partCode: string };
  }[];
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
  }[];
}

const TIMELINE_ICONS: Record<string, React.ReactNode> = {
  WAITING: <Clock size={16} className="text-yellow-500" />,
  ASSIGNED: <User size={16} className="text-blue-500" />,
  DIAGNOSING: <AlertCircle size={16} className="text-purple-500" />,
  REPAIRING: <Wrench size={16} className="text-orange-500" />,
  WAITING_PART: <Package size={16} className="text-pink-500" />,
  COMPLETED: <CheckCircle size={16} className="text-green-500" />,
  RETURNED: <CheckCircle size={16} className="text-emerald-500" />,
  CANCELLED: <AlertCircle size={16} className="text-red-500" />,
};

export default function RepairDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [repair, setRepair] = useState<RepairData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchRepair = useCallback(async () => {
    try {
      const res = await fetch(`/api/repairs/${id}`);
      const data = await res.json();
      setRepair(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRepair();
  }, [fetchRepair]);

  const updateStatus = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/repairs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchRepair();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
    setStatusLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-[#E4E6EB] rounded w-64" />
          <div className="h-96 bg-[#E4E6EB] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!repair) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-[#65676B]">ไม่พบรายการซ่อม</p>
        </div>
      </DashboardLayout>
    );
  }

  const nextActions: Record<string, { label: string; next: string }[]> = {
    WAITING: [{ label: "มอบหมายงาน", next: "ASSIGNED" }],
    ASSIGNED: [{ label: "เริ่มตรวจสอบ", next: "DIAGNOSING" }],
    DIAGNOSING: [
      { label: "เริ่มซ่อม", next: "REPAIRING" },
      { label: "รออะไหล่", next: "WAITING_PART" },
      { label: "ยกเลิก", next: "CANCELLED" },
    ],
    REPAIRING: [{ label: "ซ่อมเสร็จ", next: "COMPLETED" }],
    WAITING_PART: [{ label: "เริ่มซ่อม", next: "REPAIRING" }],
    COMPLETED: [{ label: "ส่งคืน", next: "RETURNED" }],
  };

  const actions = nextActions[repair.status] || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/repairs" className="p-2 text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] rounded-lg">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1C1E21]">{repair.repairNo}</h1>
              <p className="text-sm text-[#65676B]">
                {formatDateTime(repair.createdAt)}
              </p>
            </div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(repair.status)}`}>
              {getStatusLabel(repair.status)}
            </span>
          </div>
          <div className="flex gap-2">
            <Link href={`/repairs/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
              <Edit2 size={16} /> Edit
            </Link>
          </div>
        </div>

        {/* Status Actions */}
        {actions.length > 0 && (
          <div className="bg-white rounded-xl border border-[#DADDE1] p-4">
            <h3 className="text-sm font-medium text-[#1C1E21] mb-3">อัพเดทสถานะ:</h3>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <button
                  key={action.next}
                  onClick={() => updateStatus(action.next)}
                  disabled={statusLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] disabled:opacity-50"
                >
                  {statusLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Repair Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
              <h3 className="text-lg font-semibold text-[#1C1E21] mb-4">Repair Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="Requester" value={repair.requesterName} />
                <InfoItem label="Department" value={repair.department?.name} />
                <InfoItem label="Location" value={repair.location} />
                <InfoItem label="Problem Type" value={getProblemTypeLabel(repair.problemType)} />
                <InfoItem label="Priority" value={getPriorityLabel(repair.priority)} />
                <InfoItem label="Technician" value={repair.technician?.name} />
                <InfoItem label="Cost" value={formatCurrency(repair.cost)} />
                <InfoItem label="Computer" value={repair.computer ? `${repair.computer.assetCode} ${repair.computer.computerName || ""}` : "-"} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-[#65676B] mb-1">Problem Description</p>
                <p className="text-sm text-[#1C1E21] bg-[#F0F2F5] rounded-lg p-3">{repair.problemDescription}</p>
              </div>
              {repair.cause && (
                <div className="mt-4">
                  <p className="text-sm text-[#65676B] mb-1">Cause</p>
                  <p className="text-sm text-[#1C1E21] bg-[#F0F2F5] rounded-lg p-3">{repair.cause}</p>
                </div>
              )}
              {repair.solution && (
                <div className="mt-4">
                  <p className="text-sm text-[#65676B] mb-1">Solution</p>
                  <p className="text-sm text-[#1C1E21] bg-[#F0F2F5] rounded-lg p-3">{repair.solution}</p>
                </div>
              )}
            </div>

            {/* Parts Used */}
            <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1C1E21]">Parts Used ({repair.parts?.length || 0})</h3>
              </div>
              {repair.parts && repair.parts.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DADDE1]">
                      <th className="text-left py-2 font-medium text-[#65676B]">Part</th>
                      <th className="text-right py-2 font-medium text-[#65676B]">Qty</th>
                      <th className="text-right py-2 font-medium text-[#65676B]">Price</th>
                      <th className="text-right py-2 font-medium text-[#65676B]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repair.parts.map((rp) => (
                      <tr key={rp.id} className="border-b border-gray-50">
                        <td className="py-2">
                          <span className="font-medium">{rp.part.name}</span>
                          <span className="text-xs text-[#65676B] ml-1">({rp.part.partCode})</span>
                        </td>
                        <td className="py-2 text-right">{rp.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(rp.price)}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(rp.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-[#65676B] py-4">ยังไม่มีอะไหล่ที่ใช้</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-4">Timeline</h3>
            <div className="space-y-4">
              {repair.histories && repair.histories.length > 0 ? (
                repair.histories.map((history, index) => (
                  <div key={history.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#E4E6EB] flex items-center justify-center">
                        {TIMELINE_ICONS[history.status] || <Clock size={16} className="text-[#65676B]" />}
                      </div>
                      {index < (repair.histories?.length ?? 0) - 1 && (
                        <div className="w-0.5 flex-1 bg-[#E4E6EB] my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-xs text-[#65676B]">{formatDateTime(history.createdAt)}</p>
                      <p className="text-sm font-medium text-[#1C1E21]">{getStatusLabel(history.status)}</p>
                      {history.description && (
                        <p className="text-xs text-[#65676B] mt-0.5">{history.description}</p>
                      )}
                      {history.user && (
                        <p className="text-xs text-[#65676B] mt-0.5">by {history.user.name}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#65676B] py-4">ยังไม่มีประวัติ</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-[#65676B]">{label}</p>
      <p className="text-sm text-[#1C1E21] font-medium">{value || "-"}</p>
    </div>
  );
}
