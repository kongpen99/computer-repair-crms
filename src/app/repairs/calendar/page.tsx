"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Phone,
  User,
  Wrench,
  Trash2,
  Eye,
  Building2,
  DollarSign,
} from "lucide-react";

interface VendorAppointment {
  id: string;
  title: string;
  description: string | null;
  vendorName: string;
  contactPerson: string | null;
  contactPhone: string | null;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string | null;
  status: string;
  cost: number | null;
  remark: string | null;
  repair?: {
    id: string;
    repairNo: string;
    problemDescription: string;
    problemType: string;
    computer?: { assetCode: string; computerName: string | null } | null;
  } | null;
}

interface RepairOption {
  id: string;
  repairNo: string;
  problemDescription: string;
  computer?: { assetCode: string; computerName: string | null } | null;
}

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "นัดหมายแล้ว", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "CONFIRMED", label: "ยืนยันแล้ว", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "IN_PROGRESS", label: "กำลังดำเนินงาน", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "COMPLETED", label: "เสร็จสิ้น", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "CANCELLED", label: "ยกเลิก", color: "bg-red-100 text-red-700 border-red-200" },
];

const SERVICE_TYPES = [
  { value: "HARDWARE", label: "Hardware Maintenance", icon: "🔧", color: "bg-blue-500" },
  { value: "SOFTWARE", label: "Software Repair", icon: "💻", color: "bg-purple-500" },
];

const DAYS_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default function VendorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<VendorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairs, setRepairs] = useState<RepairOption[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<VendorAppointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vendorName: "",
    contactPerson: "",
    contactPhone: "",
    serviceType: "HARDWARE",
    appointmentTime: "09:00",
    cost: "",
    repairId: "",
    remark: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vendor-appointments?month=${month}&year=${year}`);
      const data = await res.json();
      setAppointments(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetch("/api/repairs?pageSize=200")
      .then((r) => r.json())
      .then((d) => setRepairs(d.data || []))
      .catch(console.error);
  }, []);

  // Calendar helpers
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const appointmentsForDate = (dateStr: string) =>
    appointments.filter((a) => {
      const d = new Date(a.appointmentDate);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return ds === dateStr;
    });

  const handleDateDoubleClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setFormData({
      title: "",
      description: "",
      vendorName: "",
      contactPerson: "",
      contactPhone: "",
      serviceType: "HARDWARE",
      appointmentTime: "09:00",
      cost: "",
      repairId: "",
      remark: "",
    });
    setError("");
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.vendorName) {
      setError("กรุณากรอก ชื่องาน และ ชื่อ Vendor");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/vendor-appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          appointmentDate: selectedDate,
          cost: formData.cost ? Number(formData.cost) : null,
          repairId: formData.repairId || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "เกิดข้อผิดพลาด");
        return;
      }
      setShowCreateModal(false);
      fetchAppointments();
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/vendor-appointments/${id}`, { method: "DELETE" });
      setShowDetailModal(false);
      setDeleteId(null);
      fetchAppointments();
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/vendor-appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
  };

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] bg-[#F8F9FA]" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayAppointments = appointmentsForDate(dateStr);
      const isToday =
        new Date().getFullYear() === year &&
        new Date().getMonth() + 1 === month &&
        new Date().getDate() === d;

      days.push(
        <div
          key={d}
          className={`min-h-[100px] border border-[#DADDE1] p-1.5 cursor-pointer transition-colors
            ${isToday ? "bg-[#E7F3FF] border-[#0866FF]" : "bg-white hover:bg-[#F0F2F5]"}
            ${dayAppointments.length > 0 ? "border-l-4 border-l-[#0866FF]" : ""}
          `}
          onDoubleClick={() => handleDateDoubleClick(dateStr)}
          title="Double-click เพื่อนัดหมาย Vendor"
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-[#0866FF] font-bold" : "text-[#1C1E21]"}`}>
            {d}
          </div>
          <div className="space-y-0.5">
            {dayAppointments.slice(0, 3).map((apt) => {
              const st = STATUS_OPTIONS.find((s) => s.value === apt.status);
              const svc = SERVICE_TYPES.find((s) => s.value === apt.serviceType);
              return (
                <div
                  key={apt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAppointment(apt);
                    setShowDetailModal(true);
                  }}
                  className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80
                    ${apt.serviceType === "SOFTWARE"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                    }`}
                  title={`${apt.title} - ${apt.vendorName}`}
                >
                  {svc?.icon} {apt.title}
                </div>
              );
            })}
            {dayAppointments.length > 3 && (
              <div className="text-[10px] text-[#65676B] pl-1.5">
                +{dayAppointments.length - 3} เพิ่มเติม
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
              <CalendarIcon size={24} className="text-[#0866FF]" />
              Vendor Calendar
            </h1>
            <p className="text-sm text-[#65676B] mt-1">
              ปฏิทินนัดหมาย Vendor / ช่างภายนอก — Double-click วันที่เพื่อนัดหมาย
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDateDoubleClick(new Date().toISOString().split("T")[0])}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] transition-colors"
            >
              <Plus size={18} />
              นัดหมายใหม่
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-[#DADDE1] p-4 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-[#1C1E21]">ประเภทงาน:</span>
          {SERVICE_TYPES.map((s) => (
            <div key={s.value} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${s.color}`} />
              <span className="text-xs text-[#65676B]">{s.icon} {s.label}</span>
            </div>
          ))}
          <span className="text-[#DADDE1]">|</span>
          <span className="text-sm font-medium text-[#1C1E21]">สถานะ:</span>
          {STATUS_OPTIONS.map((s) => (
            <div key={s.value} className="flex items-center gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 rounded border ${s.color}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#DADDE1]">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 2, 1))}
              className="p-2 hover:bg-[#F0F2F5] rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-[#65676B]" />
            </button>
            <h2 className="text-lg font-semibold text-[#1C1E21]">
              {MONTHS_TH[currentDate.getMonth()]} {year + 543}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month, 1))}
              className="p-2 hover:bg-[#F0F2F5] rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-[#65676B]" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#DADDE1]">
            {DAYS_TH.map((d) => (
              <div key={d} className="text-center py-2 text-sm font-medium text-[#65676B] border-r border-[#DADDE1] last:border-r-0">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="grid grid-cols-7">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="min-h-[100px] border border-[#DADDE1] p-2">
                  <div className="h-4 bg-[#E4E6EB] rounded animate-pulse w-6" />
                  <div className="mt-2 h-3 bg-[#E4E6EB] rounded animate-pulse w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">{renderCalendar()}</div>
          )}
        </div>

        {/* Upcoming Appointments List */}
        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="p-4 border-b border-[#DADDE1]">
            <h3 className="text-lg font-semibold text-[#1C1E21] flex items-center gap-2">
              <Clock size={18} className="text-[#0866FF]" />
              นัดหมายทั้งหมดเดือน {MONTHS_TH[currentDate.getMonth()]}
              <span className="text-sm font-normal text-[#65676B] ml-2">({appointments.length} รายการ)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">วันที่ / เวลา</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">หัวข้อ</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">ประเภท</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">ใบงาน</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#65676B]">
                      <CalendarIcon size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>ยังไม่มีนัดหมายในเดือนนี้</p>
                      <p className="text-xs mt-1">Double-click บนปฏิทินเพื่อสร้างนัดหมายใหม่</p>
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => {
                    const st = STATUS_OPTIONS.find((s) => s.value === apt.status);
                    const svc = SERVICE_TYPES.find((s) => s.value === apt.serviceType);
                    const d = new Date(apt.appointmentDate);
                    return (
                      <tr key={apt.id} className="hover:bg-[#F0F2F5]">
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#1C1E21]">
                            {d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                          {apt.appointmentTime && (
                            <div className="text-xs text-[#65676B] flex items-center gap-1">
                              <Clock size={12} /> {apt.appointmentTime}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#1C1E21]">{apt.title}</div>
                          {apt.description && (
                            <div className="text-xs text-[#65676B] max-w-[200px] truncate">{apt.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-[#1C1E21] flex items-center gap-1">
                            <Building2 size={14} className="text-[#65676B]" />
                            {apt.vendorName}
                          </div>
                          {apt.contactPerson && (
                            <div className="text-xs text-[#65676B] flex items-center gap-1">
                              <User size={12} /> {apt.contactPerson}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            apt.serviceType === "SOFTWARE"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {svc?.icon} {svc?.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${st?.color || ""}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          {apt.repair ? (
                            <span className="text-[#0866FF] text-xs font-medium">
                              {apt.repair.repairNo}
                            </span>
                          ) : (
                            <span className="text-xs text-[#65676B]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-[#65676B] hover:text-[#0866FF] hover:bg-[#E7F3FF] rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Create Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#DADDE1]">
              <div>
                <h3 className="text-lg font-semibold text-[#1C1E21]">สร้างนัดหมาย Vendor ใหม่</h3>
                <p className="text-sm text-[#65676B]">วันที่: {selectedDate}</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-[#F0F2F5] rounded-lg">
                <X size={20} className="text-[#65676B]" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">ชื่องาน *</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                  placeholder="เช่น ซ่อม Mainboard, ติดตั้ง Windows..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">รายละเอียด</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                  placeholder="อธิบายรายละเอียดงาน..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">ประเภทงาน *</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                  >
                    <option value="HARDWARE">🔧 Hardware Maintenance</option>
                    <option value="SOFTWARE">💻 Software Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1E21] mb-1">เวลานัดหมาย</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                  />
                </div>
              </div>

              <div className="border-t border-[#DADDE1] pt-4">
                <h4 className="text-sm font-semibold text-[#1C1E21] mb-3 flex items-center gap-2">
                  <Building2 size={16} className="text-[#0866FF]" /> ข้อมูล Vendor
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1E21] mb-1">ชื่อ Vendor *</label>
                    <input
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                      placeholder="ชื่อบริษัท / ช่าง"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1E21] mb-1">ผู้ติดต่อ</label>
                    <input
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                      placeholder="ชื่อ-นามสกุล"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1E21] mb-1">เบอร์โทร</label>
                    <input
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                      placeholder="081-234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1E21] mb-1">ค่าใช้จ่าย (฿)</label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">เชื่อมโยงงานซ่อม (ถ้ามี)</label>
                <select
                  value={formData.repairId}
                  onChange={(e) => setFormData({ ...formData, repairId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                >
                  <option value="">ไม่เชื่อมโยง</option>
                  {repairs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.repairNo} - {r.computer?.assetCode || ""} {r.problemDescription?.substring(0, 40)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1C1E21] mb-1">หมายเหตุ</label>
                <input
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-3 py-2 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-[#DADDE1]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0866FF] text-white rounded-lg text-sm font-medium hover:bg-[#0748B3] disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกนัดหมาย"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#DADDE1]">
              <h3 className="text-lg font-semibold text-[#1C1E21]">รายละเอียดนัดหมาย</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-[#F0F2F5] rounded-lg">
                <X size={20} className="text-[#65676B]" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                  selectedAppointment.serviceType === "SOFTWARE" ? "bg-purple-500" : "bg-blue-500"
                }`}>
                  {selectedAppointment.serviceType === "SOFTWARE" ? "💻" : "🔧"}
                </div>
                <div>
                  <h4 className="font-semibold text-[#1C1E21]">{selectedAppointment.title}</h4>
                  <p className="text-sm text-[#65676B]">
                    {SERVICE_TYPES.find((s) => s.value === selectedAppointment.serviceType)?.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F0F2F5] rounded-lg p-3">
                  <div className="text-xs text-[#65676B]">วันที่นัดหมาย</div>
                  <div className="font-medium text-[#1C1E21]">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString("th-TH", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </div>
                </div>
                <div className="bg-[#F0F2F5] rounded-lg p-3">
                  <div className="text-xs text-[#65676B]">เวลา</div>
                  <div className="font-medium text-[#1C1E21] flex items-center gap-1">
                    <Clock size={14} /> {selectedAppointment.appointmentTime || "-"}
                  </div>
                </div>
              </div>

              <div className="bg-[#F0F2F5] rounded-lg p-3">
                <div className="text-xs text-[#65676B]">Vendor</div>
                <div className="font-medium text-[#1C1E21] flex items-center gap-1">
                  <Building2 size={14} /> {selectedAppointment.vendorName}
                </div>
                {selectedAppointment.contactPerson && (
                  <div className="text-sm text-[#65676B] flex items-center gap-1 mt-1">
                    <User size={12} /> {selectedAppointment.contactPerson}
                  </div>
                )}
                {selectedAppointment.contactPhone && (
                  <div className="text-sm text-[#65676B] flex items-center gap-1 mt-1">
                    <Phone size={12} /> {selectedAppointment.contactPhone}
                  </div>
                )}
              </div>

              {selectedAppointment.description && (
                <div className="bg-[#F0F2F5] rounded-lg p-3">
                  <div className="text-xs text-[#65676B]">รายละเอียด</div>
                  <div className="text-sm text-[#1C1E21] mt-1">{selectedAppointment.description}</div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-[#65676B]">สถานะ</div>
                  <select
                    value={selectedAppointment.status}
                    onChange={(e) => {
                      handleStatusChange(selectedAppointment.id, e.target.value);
                      setSelectedAppointment({ ...selectedAppointment, status: e.target.value });
                    }}
                    className={`text-sm px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                      STATUS_OPTIONS.find((s) => s.value === selectedAppointment.status)?.color || ""
                    }`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                {selectedAppointment.cost != null && selectedAppointment.cost > 0 && (
                  <div>
                    <div className="text-xs text-[#65676B]">ค่าใช้จ่าย</div>
                    <div className="font-medium text-[#1C1E21] flex items-center gap-1">
                      <DollarSign size={14} /> ฿{selectedAppointment.cost.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {selectedAppointment.repair && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <Wrench size={12} /> ใบงานซ่อมที่เชื่อมโยง
                  </div>
                  <div className="text-sm text-blue-800 mt-1">
                    {selectedAppointment.repair.repairNo} — {selectedAppointment.repair.problemDescription?.substring(0, 60)}
                  </div>
                </div>
              )}

              {selectedAppointment.remark && (
                <div className="bg-[#F0F2F5] rounded-lg p-3">
                  <div className="text-xs text-[#65676B]">หมายเหตุ</div>
                  <div className="text-sm text-[#1C1E21]">{selectedAppointment.remark}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between p-4 border-t border-[#DADDE1]">
              <button
                onClick={() => setDeleteId(selectedAppointment.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#FA3E3E] border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={16} /> ลบ
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#1C1E21] mb-2">ยืนยันการลบ</h3>
            <p className="text-sm text-[#65676B] mb-6">ต้องการลบนัดหมายนี้ใช่หรือไม่?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
                ยกเลิก
              </button>
              <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-[#FA3E3E] text-white rounded-lg hover:bg-[#E03333]">
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
