import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: th });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: th });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

export function generateRepairNo(date: Date = new Date()): string {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `RPR${year}${month}${day}-${random}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    WAITING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
    DIAGNOSING: "bg-purple-100 text-purple-800 border-purple-200",
    REPAIRING: "bg-orange-100 text-orange-800 border-orange-200",
    WAITING_PART: "bg-pink-100 text-pink-800 border-pink-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    RETURNED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    WAITING: "รอดำเนินการ",
    ASSIGNED: "มอบหมายงานแล้ว",
    DIAGNOSING: "กำลังตรวจสอบ",
    REPAIRING: "กำลังซ่อม",
    WAITING_PART: "รออะไหล่",
    COMPLETED: "ซ่อมเสร็จ",
    RETURNED: "ส่งคืนแล้ว",
    CANCELLED: "ยกเลิก",
  };
  return labels[status] || status;
}

export function getComputerStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NORMAL: "ปกติ",
    REPAIR: "กำลังซ่อม",
    DAMAGED: "เสียหาย",
    RETIRED: "ปลดระวาง",
    LOST: "สูญหาย",
  };
  return labels[status] || status;
}

export function getComputerStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NORMAL: "bg-green-100 text-green-800 border-green-200",
    REPAIR: "bg-orange-100 text-orange-800 border-orange-200",
    DAMAGED: "bg-red-100 text-red-800 border-red-200",
    RETIRED: "bg-gray-100 text-gray-800 border-gray-200",
    LOST: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getProblemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HARDWARE: "Hardware",
    SOFTWARE: "Software",
    NETWORK: "Network",
    WINDOWS: "Windows",
    PRINTER: "Printer",
    VIRUS_MALWARE: "Virus/Malware",
    OTHER: "Other",
  };
  return labels[type] || type;
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: "ต่ำ",
    MEDIUM: "ปานกลาง",
    HIGH: "สูง",
    URGENT: "เร่งด่วน",
  };
  return labels[priority] || priority;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-800 border-gray-200",
    MEDIUM: "bg-blue-100 text-blue-800 border-blue-200",
    HIGH: "bg-orange-100 text-orange-800 border-orange-200",
    URGENT: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "ผู้ดูแลระบบ",
    TECHNICIAN: "ช่างเทคนิค",
  };
  return labels[role] || role;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
