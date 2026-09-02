"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Monitor,
  Wrench,
  Clock,
  Play,
  CheckCircle2,
  RotateCcw,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getStatusLabel, getStatusColor, getProblemTypeLabel, formatDateTime } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  totalComputers: number;
  totalRepairs: number;
  waitingCount: number;
  repairingCount: number;
  completedCount: number;
  returnedCount: number;
  currentMonthRepairs: number;
  problemComputerCount: number;
  statusCounts: { status: string; count: number }[];
  problemTypeCounts: { problemType: string; count: number }[];
  monthlyRepairs: { date: string; count: number }[];
  recentRepairs: {
    id: string;
    repairNo: string;
    problemDescription: string;
    status: string;
    createdAt: string;
    computer?: { assetCode: string; computerName: string } | null;
    technician?: { name: string } | null;
  }[];
}

const STATUS_COLORS = [
  "#F7B928", "#0866FF", "#A78BFA", "#FB923C", "#F472B6", "#42B72A", "#2DD4BF", "#FA3E3E",
];
const PIE_COLORS = ["#0866FF", "#42B72A", "#F7B928", "#FA3E3E", "#8B5CF6", "#EC4899", "#6366F1", "#F97316"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-[#E4E6EB] rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-[#E4E6EB] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: "เครื่องทั้งหมด", value: data.totalComputers, icon: Monitor, color: "bg-[#0866FF]" },
    { label: "งานซ่อมทั้งหมด", value: data.totalRepairs, icon: Wrench, color: "bg-[#8B5CF6]" },
    { label: "รอดำเนินการ", value: data.waitingCount, icon: Clock, color: "bg-[#F7B928]" },
    { label: "กำลังซ่อม", value: data.repairingCount, icon: Play, color: "bg-[#FB923C]" },
    { label: "ซ่อมเสร็จ", value: data.completedCount, icon: CheckCircle2, color: "bg-[#42B72A]" },
    { label: "ส่งคืนแล้ว", value: data.returnedCount, icon: RotateCcw, color: "bg-[#0866FF]" },
    { label: "เดือนปัจจุบัน", value: data.currentMonthRepairs, icon: CalendarDays, color: "bg-[#6366F1]" },
    { label: "มีปัญหา", value: data.problemComputerCount, icon: AlertTriangle, color: "bg-[#FA3E3E]" },
  ];

  // Aggregate monthly data
  const monthlyAgg: Record<string, number> = {};
  data.monthlyRepairs.forEach((item) => {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyAgg[key] = (monthlyAgg[key] || 0) + item.count;
  });

  const monthlyChartData = Object.entries(monthlyAgg)
    .map(([key, count]) => ({
      month: key,
      count,
    }))
    .slice(-12);

  const problemTypeData = data.problemTypeCounts.map((item) => ({
    name: getProblemTypeLabel(item.problemType),
    value: item.count,
  }));

  const statusData = data.statusCounts.map((item) => ({
    name: getStatusLabel(item.status),
    value: item.count,
    status: item.status,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#DADDE1] p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`${card.color} p-3 rounded-xl text-white`}>
                <card.icon size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1C1E21]">{card.value}</p>
                <p className="text-sm text-[#65676B]">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
          <h3 className="text-lg font-bold text-[#1C1E21] mb-4">สถิติงานซ่อมรายเดือน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E6EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#65676B" }} />
              <YAxis tick={{ fontSize: 12, fill: "#65676B" }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #DADDE1', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0866FF"
                strokeWidth={3}
                dot={{ fill: '#0866FF', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: '#0748B3' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-bold text-[#1C1E21] mb-4">ประเภทปัญหา</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={problemTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {problemTypeData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
            <h3 className="text-lg font-bold text-[#1C1E21] mb-4">สถานะงานซ่อม</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Repairs */}
        <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1C1E21]">งานซ่อมล่าสุด</h3>
            <Link
              href="/repairs"
              className="text-sm text-[#0866FF] hover:underline font-semibold"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E6EB]">
                  <th className="text-left py-3 px-2 font-semibold text-[#65676B]">Repair ID</th>
                  <th className="text-left py-3 px-2 font-semibold text-[#65676B]">Computer</th>
                  <th className="text-left py-3 px-2 font-semibold text-[#65676B]">Problem</th>
                  <th className="text-left py-3 px-2 font-semibold text-[#65676B]">Technician</th>
                  <th className="text-left py-3 px-2 font-semibold text-[#65676B]">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-[#65676B]">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRepairs.map((repair) => (
                  <tr key={repair.id} className="border-b border-[#F0F2F5] hover:bg-[#F0F2F5] transition-colors">
                    <td className="py-3 px-2">
                      <Link
                        href={`/repairs/${repair.id}`}
                        className="text-[#0866FF] hover:underline font-semibold"
                      >
                        {repair.repairNo}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-[#1C1E21]">
                      {repair.computer?.assetCode || "-"}
                      <br />
                      <span className="text-xs text-[#65676B]">
                        {repair.computer?.computerName || ""}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#1C1E21] max-w-[200px] truncate">
                      {repair.problemDescription}
                    </td>
                    <td className="py-3 px-2 text-[#1C1E21]">
                      {repair.technician?.name || "-"}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(repair.status)}`}
                      >
                        {getStatusLabel(repair.status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#65676B] text-xs">
                      {formatDateTime(repair.createdAt)}
                    </td>
                  </tr>
                ))}
                {data.recentRepairs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#65676B]">
                      ยังไม่มีรายการซ่อม
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
