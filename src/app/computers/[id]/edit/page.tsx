"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { DepartmentType } from "@/types/user";

interface ComputerData {
  assetCode: string;
  serialNumber: string;
  computerName: string;
  brand: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  operatingSystem: string;
  ipAddress: string;
  macAddress: string;
  departmentId: string;
  location: string;
  assignedUser: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: string;
  remark: string;
}

export default function EditComputerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ComputerData>({
    assetCode: "", serialNumber: "", computerName: "", brand: "", model: "",
    cpu: "", ram: "", storage: "", operatingSystem: "", ipAddress: "", macAddress: "",
    departmentId: "", location: "", assignedUser: "", purchaseDate: "", warrantyExpiry: "",
    status: "NORMAL", remark: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/computers/${id}`).then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
    ]).then(([compData, deptData]) => {
      const c = compData.data;
      if (c) {
        setForm({
          assetCode: c.assetCode || "",
          serialNumber: c.serialNumber || "",
          computerName: c.computerName || "",
          brand: c.brand || "",
          model: c.model || "",
          cpu: c.cpu || "",
          ram: c.ram || "",
          storage: c.storage || "",
          operatingSystem: c.operatingSystem || "",
          ipAddress: c.ipAddress || "",
          macAddress: c.macAddress || "",
          departmentId: c.departmentId || "",
          location: c.location || "",
          assignedUser: c.assignedUser || "",
          purchaseDate: c.purchaseDate ? c.purchaseDate.split("T")[0] : "",
          warrantyExpiry: c.warrantyExpiry ? c.warrantyExpiry.split("T")[0] : "",
          status: c.status || "NORMAL",
          remark: c.remark || "",
        });
      }
      setDepartments(deptData.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/computers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "เกิดข้อผิดพลาด"); return; }
      router.push(`/computers/${id}`);
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
          <Link href={`/computers/${id}`} className="p-2 text-[#65676B] hover:text-[#1C1E21] hover:bg-[#E4E6EB] rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#1C1E21]">Edit Computer</h1>
        </div>

        {error && <div className="p-4 bg-[#FDEDEF] border border-red-200 rounded-lg text-sm text-[#FA3E3E]">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Asset Code *</label>
                <input name="assetCode" value={form.assetCode} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Serial Number</label>
                <input name="serialNumber" value={form.serialNumber} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Computer Name</label>
                <input name="computerName" value={form.computerName} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                  <option value="NORMAL">ปกติ</option>
                  <option value="REPAIR">กำลังซ่อม</option>
                  <option value="DAMAGED">เสียหาย</option>
                  <option value="RETIRED">ปลดระวาง</option>
                  <option value="LOST">สูญหาย</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Brand</label>
                <input name="brand" value={form.brand} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Model</label>
                <input name="model" value={form.model} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">CPU</label>
                <input name="cpu" value={form.cpu} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">RAM</label>
                <input name="ram" value={form.ram} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Storage</label>
                <input name="storage" value={form.storage} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Operating System</label>
                <input name="operatingSystem" value={form.operatingSystem} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">IP Address</label>
                <input name="ipAddress" value={form.ipAddress} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">MAC Address</label>
                <input name="macAddress" value={form.macAddress} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Department</label>
                <select name="departmentId" value={form.departmentId} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]">
                  <option value="">Select Department</option>
                  {departments.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Assigned User</label>
                <input name="assignedUser" value={form.assignedUser} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Purchase Date</label>
                <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">Warranty Expiry</label>
                <input type="date" name="warrantyExpiry" value={form.warrantyExpiry} onChange={handleChange} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#1C1E21] mb-1">Remark</label>
              <textarea name="remark" value={form.remark} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href={`/computers/${id}`} className="px-6 py-2.5 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">ยกเลิก</Link>
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
