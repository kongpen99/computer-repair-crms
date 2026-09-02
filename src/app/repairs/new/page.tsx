"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { DepartmentType } from "@/types/user";

interface ComputerOption {
  id: string;
  assetCode: string;
  computerName: string | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  assignedUser: string | null;
  departmentId: string | null;
}

interface TechnicianOption {
  id: string;
  name: string;
}

export default function NewRepairPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [computers, setComputers] = useState<ComputerOption[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    computerId: "",
    requesterName: "",
    departmentId: "",
    location: "",
    problemDescription: "",
    problemType: "HARDWARE",
    priority: "MEDIUM",
    technicianId: "",
    cost: "",
    remark: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/computers?pageSize=200").then((r) => r.json()),
      fetch("/api/users?role=TECHNICIAN").then((r) => r.json()),
    ]).then(([depts, comps, techs]) => {
      setDepartments(depts.data || []);
      setComputers(comps.data || []);
      setTechnicians(techs.data || []);
    }).catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-fill when computer is selected
      if (name === "computerId" && value) {
        const comp = computers.find((c) => c.id === value);
        if (comp) {
          updated.departmentId = comp.departmentId || "";
          updated.location = comp.location || "";
          updated.requesterName = comp.assignedUser || "";
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.requesterName || !form.problemDescription) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      router.push(`/repairs/${data.data.id}`);
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/repairs" className="p-2 text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1C1E21]">New Repair Request</h1>
            <p className="text-sm text-[#65676B]">สร้างรายการซ่อมใหม่</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E]">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Computer Selection */}
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-4">Computer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Computer (ถ้ามี)</label>
                <select name="computerId" value={form.computerId} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                  <option value="">Select Computer</option>
                  {computers.map((c) => (
                    <option key={c.id} value={c.id}>{c.assetCode} - {c.computerName || ""} ({c.brand || ""})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Requester Name *</label>
                <input name="requesterName" value={form.requesterName} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Department</label>
                <select name="departmentId" value={form.departmentId} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
            </div>
          </div>

          {/* Problem Info */}
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-4">Problem Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Problem Description *</label>
                <textarea name="problemDescription" value={form.problemDescription} onChange={handleChange}
                  rows={4} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                  placeholder="อธิบายอาการเสีย..." required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Problem Type</label>
                  <select name="problemType" value={form.problemType} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="NETWORK">Network</option>
                    <option value="WINDOWS">Windows</option>
                    <option value="PRINTER">Printer</option>
                    <option value="VIRUS_MALWARE">Virus/Malware</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                    <option value="LOW">ต่ำ</option>
                    <option value="MEDIUM">ปานกลาง</option>
                    <option value="HIGH">สูง</option>
                    <option value="URGENT">เร่งด่วน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Technician</label>
                  <select name="technicianId" value={form.technicianId} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                    <option value="">Select Technician</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Cost (฿)</label>
                  <input type="number" name="cost" value={form.cost} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Remark</label>
                  <input name="remark" value={form.remark} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/repairs" className="px-6 py-2.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
              ยกเลิก
            </Link>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
