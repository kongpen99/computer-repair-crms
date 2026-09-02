"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { Search as SearchIcon, Monitor, Wrench } from "lucide-react";
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [computers, setComputers] = useState<{ id: string; assetCode: string; computerName: string | null; brand: string | null; status: string }[]>([]);
  const [repairs, setRepairs] = useState<{ id: string; repairNo: string; problemDescription: string; status: string; createdAt: string; computer?: { assetCode: string } | null }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setComputers([]);
      setRepairs([]);
      return;
    }

    setLoading(true);
    try {
      const [compRes, repairRes] = await Promise.all([
        fetch(`/api/computers?search=${encodeURIComponent(q)}&pageSize=10`),
        fetch(`/api/repairs?search=${encodeURIComponent(q)}&pageSize=10`),
      ]);
      const compData = await compRes.json();
      const repairData = await repairRes.json();
      setComputers(compData.data || []);
      setRepairs(repairData.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) search(initialQuery);
  }, [initialQuery, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1E21] flex items-center gap-2">
          <SearchIcon size={24} className="text-[#0866FF]" />
          Search
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-[#DADDE1] p-4">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
          <input
            type="text"
            placeholder="ค้นหา Asset Code, Serial, Computer Name, Repair ID, User, Department, Problem..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-4 py-3 border border-[#DADDE1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#65676B] mt-2">กำลังค้นหา...</p>
        </div>
      )}

      {!loading && query && computers.length === 0 && repairs.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-[#65676B]">ไม่พบผลลัพธ์สำหรับ &quot;{query}&quot;</p>
        </div>
      )}

      {computers.length > 0 && (
        <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
            <Monitor size={20} className="text-[#0866FF]" />
            Computers ({computers.length})
          </h3>
          <div className="space-y-2">
            {computers.map((c) => (
              <Link
                key={c.id}
                href={`/computers/${c.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F0F2F5] border border-[#DADDE1]"
              >
                <div>
                  <span className="font-medium text-[#0866FF]">{c.assetCode}</span>
                  <span className="text-[#1C1E21] ml-2">{c.computerName || ""}</span>
                  <span className="text-[#65676B] text-xs ml-2">{c.brand || ""}</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(c.status === "NORMAL" ? "COMPLETED" : "REPAIRING")}`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {repairs.length > 0 && (
        <div className="bg-white rounded-xl border border-[#DADDE1] p-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1C1E21] mb-4">
            <Wrench size={20} className="text-orange-600" />
            Repairs ({repairs.length})
          </h3>
          <div className="space-y-2">
            {repairs.map((r) => (
              <Link
                key={r.id}
                href={`/repairs/${r.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F0F2F5] border border-[#DADDE1]"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-[#0866FF]">{r.repairNo}</span>
                  {r.computer && <span className="text-[#65676B] text-xs ml-2">{r.computer.assetCode}</span>}
                  <p className="text-sm text-[#1C1E21] truncate mt-0.5">{r.problemDescription}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-[#65676B]">{formatDate(r.createdAt)}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                    {getStatusLabel(r.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-[#E4E6EB] rounded w-64" />
          <div className="h-16 bg-[#E4E6EB] rounded-xl" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </DashboardLayout>
  );
}
