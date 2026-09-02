"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart3, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getStatusLabel, getProblemTypeLabel, formatCurrency } from "@/lib/utils";

interface RepairReport {
  totalRepairs: number;
  statusCounts: { status: string; count: number }[];
  problemTypeCounts: { problemType: string; count: number }[];
  departmentCounts: { departmentId: string; departmentName: string; count: number }[];
  technicianCounts: { technicianId: string; technicianName: string; count: number }[];
}

interface ComputerReport {
  totalComputers: number;
  statusCounts: { status: string; count: number }[];
  departmentCounts: { departmentId: string; departmentName: string; count: number }[];
  mostRepaired: { assetCode: string; computerName: string | null; brand: string | null; repairCount: number }[];
}

interface CostReport {
  totalRepairCost: number;
  totalPartCost: number;
  grandTotal: number;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#6366F1", "#F97316"];

export default function ReportsPage() {
  const [tab, setTab] = useState<"repairs" | "computers" | "cost">("repairs");
  const [repairData, setRepairData] = useState<RepairReport | null>(null);
  const [computerData, setComputerData] = useState<ComputerReport | null>(null);
  const [costData, setCostData] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/reports?type=repairs").then((r) => r.json()),
      fetch("/api/reports?type=computers").then((r) => r.json()),
      fetch("/api/reports?type=cost").then((r) => r.json()),
    ])
      .then(([repairs, computers, cost]) => {
        setRepairData(repairs.data);
        setComputerData(computers.data);
        setCostData(cost.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = (type: string) => {
    let csvContent = "";
    let filename = "";

    if (type === "repair-status" && repairData) {
      csvContent = "Status,Count\n";
      repairData.statusCounts.forEach((s) => {
        csvContent += `${getStatusLabel(s.status)},${s.count}\n`;
      });
      filename = "repair-status-report.csv";
    } else if (type === "repair-problem" && repairData) {
      csvContent = "Problem Type,Count\n";
      repairData.problemTypeCounts.forEach((p) => {
        csvContent += `${getProblemTypeLabel(p.problemType)},${p.count}\n`;
      });
      filename = "repair-problem-report.csv";
    } else if (type === "repair-dept" && repairData) {
      csvContent = "Department,Count\n";
      repairData.departmentCounts.forEach((d) => {
        csvContent += `${d.departmentName},${d.count}\n`;
      });
      filename = "repair-department-report.csv";
    } else if (type === "computer-status" && computerData) {
      csvContent = "Status,Count\n";
      computerData.statusCounts.forEach((s) => {
        csvContent += `${s.status},${s.count}\n`;
      });
      filename = "computer-status-report.csv";
    }

    if (csvContent) {
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-[#E4E6EB] rounded w-64" />
          <div className="h-80 bg-[#E4E6EB] rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
          <BarChart3 size={24} className="text-[#0866FF]" />
          Reports
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#E4E6EB] p-1 rounded-lg w-fit">
          {(["repairs", "computers", "cost"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t ? "bg-white shadow-sm text-[#0866FF]" : "text-gray-600 hover:text-[#1C1E21]"
              }`}
            >
              {t === "repairs" ? "Repair Report" : t === "computers" ? "Computer Report" : "Cost Report"}
            </button>
          ))}
        </div>

        {/* Repair Report */}
        {tab === "repairs" && repairData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#DADDE1] p-4 text-center">
                <p className="text-3xl font-bold text-[#0866FF]">{repairData.totalRepairs}</p>
                <p className="text-sm text-[#65676B]">Total Repairs</p>
              </div>
              {repairData.statusCounts.slice(0, 3).map((s) => (
                <div key={s.status} className="bg-white rounded-xl border border-[#DADDE1] p-4 text-center">
                  <p className="text-3xl font-bold text-[#1C1E21]">{s.count}</p>
                  <p className="text-sm text-[#65676B]">{getStatusLabel(s.status)}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Repairs by Status</h3>
                <button onClick={() => handleExportCSV("repair-status")}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
                  <Download size={14} /> Export CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repairData.statusCounts.map((s) => ({ name: getStatusLabel(s.status), count: s.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {repairData.statusCounts.map((_, index) => (
                      <rect key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Repairs by Problem Type</h3>
                  <button onClick={() => handleExportCSV("repair-problem")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
                    <Download size={14} /> Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={repairData.problemTypeCounts.map((p) => ({ name: getProblemTypeLabel(p.problemType), count: p.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {repairData.problemTypeCounts.map((_, index) => (
                        <rect key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Repairs by Department</h3>
                  <button onClick={() => handleExportCSV("repair-dept")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
                    <Download size={14} /> Export
                  </button>
                </div>
                <div className="space-y-3">
                  {repairData.departmentCounts.map((d) => (
                    <div key={d.departmentId} className="flex items-center gap-3">
                      <span className="text-sm text-[#1C1E21] flex-1">{d.departmentName}</span>
                      <div className="w-32 bg-[#E4E6EB] rounded-full h-2">
                        <div
                          className="bg-[#E7F3FF]0 h-2 rounded-full"
                          style={{ width: `${(d.count / Math.max(...repairData.departmentCounts.map((x) => x.count), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#1C1E21] w-8 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
              <h3 className="text-lg font-semibold mb-4">Top Technicians</h3>
              <div className="space-y-3">
                {repairData.technicianCounts.map((t, i) => (
                  <div key={t.technicianId} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#65676B] w-6">{i + 1}.</span>
                    <span className="text-sm text-[#1C1E21] flex-1">{t.technicianName}</span>
                    <span className="text-sm font-medium text-[#1C1E21]">{t.count} jobs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Computer Report */}
        {tab === "computers" && computerData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#DADDE1] p-4 text-center">
                <p className="text-3xl font-bold text-[#0866FF]">{computerData.totalComputers}</p>
                <p className="text-sm text-[#65676B]">Total Computers</p>
              </div>
              {computerData.statusCounts.map((s) => (
                <div key={s.status} className="bg-white rounded-xl border border-[#DADDE1] p-4 text-center">
                  <p className="text-3xl font-bold text-[#1C1E21]">{s.count}</p>
                  <p className="text-sm text-[#65676B]">{s.status}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Computers by Department</h3>
                  <button onClick={() => handleExportCSV("computer-status")}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#DADDE1] rounded-lg hover:bg-[#F0F2F5]">
                    <Download size={14} /> Export
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={computerData.departmentCounts.map((d) => ({ name: d.departmentName, count: d.count }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
                <h3 className="text-lg font-semibold mb-4">Most Repaired Computers</h3>
                <div className="space-y-3">
                  {computerData.mostRepaired.map((c, i) => (
                    <div key={c.assetCode} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#65676B] w-6">{i + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1C1E21]">{c.assetCode}</p>
                        <p className="text-xs text-[#65676B]">{c.computerName} ({c.brand})</p>
                      </div>
                      <span className="text-sm font-medium text-[#FA3E3E]">{c.repairCount} times</span>
                    </div>
                  ))}
                  {computerData.mostRepaired.length === 0 && (
                    <p className="text-center text-[#65676B] py-4">No data</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Report */}
        {tab === "cost" && costData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-[#DADDE1] p-6 text-center">
                <p className="text-sm text-[#65676B] mb-1">Total Repair Cost</p>
                <p className="text-3xl font-bold text-[#0866FF]">{formatCurrency(costData.totalRepairCost)}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#DADDE1] p-6 text-center">
                <p className="text-sm text-[#65676B] mb-1">Total Parts Cost</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(costData.totalPartCost)}</p>
              </div>
              <div className="bg-white rounded-xl border border-[#DADDE1] p-6 text-center">
                <p className="text-sm text-[#65676B] mb-1">Grand Total</p>
                <p className="text-3xl font-bold text-[#42B72A]">{formatCurrency(costData.grandTotal)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
