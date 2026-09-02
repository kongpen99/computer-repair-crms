"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertTriangle, Package } from "lucide-react";

interface LowStockPart {
  id: string;
  partCode: string;
  name: string;
  stock: number;
  minimumStock: number;
  unit: string | null;
}

export default function LowStockPage() {
  const [parts, setParts] = useState<LowStockPart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parts?pageSize=200")
      .then((res) => res.json())
      .then((json) => {
        const allParts = json.data || [];
        const lowParts = allParts.filter(
          (p: LowStockPart) => p.stock <= p.minimumStock
        );
        setParts(lowParts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
            <AlertTriangle size={24} className="text-yellow-500" />
            Stock Alert
          </h1>
          <p className="text-sm text-[#65676B] mt-1">
            อะไหล่ที่ stock ต่ำกว่า minimum stock ({parts.length} รายการ)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#DADDE1] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F2F5]">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Part Code</th>
                  <th className="text-left py-3 px-4 font-medium text-[#65676B]">Name</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Current Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Minimum Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-[#65676B]">Deficit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="py-4 px-4">
                        <div className="h-4 bg-[#E4E6EB] rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : parts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#65676B]">
                      <Package size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>ไม่มีอะไหล่ที่ stock ต่ำ</p>
                    </td>
                  </tr>
                ) : (
                  parts.map((part) => (
                    <tr key={part.id} className="hover:bg-[#F0F2F5]">
                      <td className="py-3 px-4 font-medium text-[#1C1E21]">{part.partCode}</td>
                      <td className="py-3 px-4 text-[#1C1E21]">{part.name}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-bold ${part.stock === 0 ? "text-[#FA3E3E]" : "text-orange-600"}`}>
                          <AlertTriangle size={14} />
                          {part.stock} {part.unit || ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#65676B]">{part.minimumStock}</td>
                      <td className="py-3 px-4 text-right text-[#FA3E3E] font-medium">
                        {part.minimumStock - part.stock}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
