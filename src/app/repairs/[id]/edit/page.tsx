"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface RepairData {
  id: string;
  computerId: string;
  requesterName: string;
  departmentId: string;
  location: string;
  problemDescription: string;
  problemType: string;
  priority: string;
  technicianId: string;
  cause: string;
  solution: string;
  cost: string;
  remark: string;
  status: string;
}

export default function EditRepairPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<RepairData>({
    id: "", computerId: "", requesterName: "", departmentId: "", location: "",
    problemDescription: "", problemType: "HARDWARE", priority: "MEDIUM",
    technicianId: "", cause: "", solution: "", cost: "", remark: "", status: "WAITING",
  });

  useEffect(() => {
    fetch(`/api/repairs/${id}`)
      .then((r) => r.json())
      .then((json) => {
        const r = json.data;
        if (r) {
          setForm({
            id: r.id, computerId: r.computerId || "", requesterName: r.requesterName || "",
            departmentId: r.departmentId || "", location: r.location || "",
            problemDescription: r.problemDescription || "", problemType: r.problemType || "HARDWARE",
            priority: r.priority || "MEDIUM", technicianId: r.technicianId || "",
            cause: r.cause || "", solution: r.solution || "",
            cost: r.cost?.toString() || "", remark: r.remark || "", status: r.status || "WAITING",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/repairs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "เกิดข้อผิดพลาด"); return; }
      router.push(`/repairs/${id}`);
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/repairs/${id}`} className="p-2 text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1C1E21]">Edit Repair</h1>
        </div>

        {error && <div className="p-4 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E]">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-4">Problem Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Requester Name *</label>
                  <input name="requesterName" value={form.requesterName} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
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
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">Cost (฿)</label>
                  <input type="number" name="cost" value={form.cost} onChange={handleChange}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Problem Description *</label>
                <textarea name="problemDescription" value={form.problemDescription} onChange={handleChange}
                  rows={3} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Cause</label>
                <textarea name="cause" value={form.cause} onChange={handleChange}
                  rows={2} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Solution</label>
                <textarea name="solution" value={form.solution} onChange={handleChange}
                  rows={2} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Remark</label>
                <input name="remark" value={form.remark} onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/repairs/${id}`} className="px-6 py-2.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">ยกเลิก</Link>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] disabled:opacity-50">
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
