"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Wrench, Monitor, HardDrive, Network,
  MapPin, Calendar, Shield, Trash2
} from "lucide-react";
import {
  getComputerStatusLabel, getComputerStatusColor,
  getStatusLabel, getStatusColor,
  formatDate, formatDateTime,
} from "@/lib/utils";
import type { ComputerType } from "@/types/computer";
import type { RepairType } from "@/types/repair";

type ComputerWithRepairs = ComputerType & { repairs: RepairType[] };

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#65676B]">{label}</span>
      <span className="text-[#1C1E21] font-medium text-right">{value || "-"}</span>
    </div>
  );
}

export default function ComputerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [computer, setComputer] = useState<ComputerWithRepairs | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/computers/${id}`)
      .then((res) => res.json())
      .then((json) => setComputer(json.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/computers/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/computers");
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-[#E4E6EB] rounded w-64" />
          <div className="h-64 bg-[#E4E6EB] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!computer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-[#65676B]">ไม่พบข้อมูล Computer</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/computers"
              className="p-2 text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1C1E21]">
                {computer.computerName || computer.assetCode}
              </h1>
              <p className="text-sm text-[#65676B]">{computer.assetCode}</p>
            </div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${getComputerStatusColor(computer.status)}`}
            >
              {getComputerStatusLabel(computer.status)}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/computers/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]"
            >
              <Edit2 size={16} />
              Edit
            </Link>
            <button
              onClick={() => setDeleteId(id)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#FA3E3E] border border-red-200 rounded-lg hover:bg-[#FDEDEF]"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Computer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
              <Monitor size={20} className="text-[#0866FF]" />
              Basic Information
            </h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="Asset Code" value={computer.assetCode} />
              <InfoRow label="Serial Number" value={computer.serialNumber} />
              <InfoRow label="Computer Name" value={computer.computerName} />
              <InfoRow label="Brand" value={computer.brand} />
              <InfoRow label="Model" value={computer.model} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
              <HardDrive size={20} className="text-purple-600" />
              Hardware
            </h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="CPU" value={computer.cpu} />
              <InfoRow label="RAM" value={computer.ram} />
              <InfoRow label="Storage" value={computer.storage} />
              <InfoRow label="Operating System" value={computer.operatingSystem} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
              <Network size={20} className="text-[#42B72A]" />
              Network
            </h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="IP Address" value={computer.ipAddress} />
              <InfoRow label="MAC Address" value={computer.macAddress} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
              <MapPin size={20} className="text-orange-600" />
              Location & Assignment
            </h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="Department" value={computer.department?.name} />
              <InfoRow label="Location" value={computer.location} />
              <InfoRow label="Assigned User" value={computer.assignedUser} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
              <Calendar size={20} className="text-indigo-600" />
              Purchase Info
            </h3>
            <div className="space-y-3 text-sm">
              <InfoRow label="Purchase Date" value={formatDate(computer.purchaseDate)} />
              <InfoRow label="Warranty Expiry" value={formatDate(computer.warrantyExpiry)} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
              <Shield size={20} className="text-gray-600" />
              Remark
            </h3>
            <p className="text-sm text-[#1C1E21]">{computer.remark || "-"}</p>
          </div>
        </div>

        {/* Repair History */}
        <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21]">
              <Wrench size={20} className="text-[#FA3E3E]" />
              Repair History ({computer.repairs?.length || 0})
            </h3>
          </div>
          {computer.repairs && computer.repairs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DADDE1]">
                    <th className="text-left py-2 px-2 font-medium text-[#65676B]">Repair ID</th>
                    <th className="text-left py-2 px-2 font-medium text-[#65676B]">Problem</th>
                    <th className="text-left py-2 px-2 font-medium text-[#65676B]">Technician</th>
                    <th className="text-left py-2 px-2 font-medium text-[#65676B]">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-[#65676B]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {computer.repairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-[#F0F2F5]">
                      <td className="py-2 px-2">
                        <Link href={`/repairs/${repair.id}`} className="text-[#0866FF] hover:underline">
                          {repair.repairNo}
                        </Link>
                      </td>
                      <td className="py-2 px-2 text-[#1C1E21] max-w-[200px] truncate">
                        {repair.problemDescription}
                      </td>
                      <td className="py-2 px-2 text-[#1C1E21]">
                        {repair.technician?.name || "-"}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(repair.status)}`}>
                          {getStatusLabel(repair.status)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-[#65676B] text-xs">
                        {formatDateTime(repair.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-[#65676B] py-8">ยังไม่มีประวัติการซ่อม</p>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-[#65676B] mb-6">คุณต้องการลบ Computer นี้ใช่หรือไม่?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
                ยกเลิก
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-[#FA3E3E] text-white rounded-lg hover:bg-[#E03333]">
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
