"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Search, Bell, User, LogOut, Plus, Monitor, Wrench, Settings, Shield } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  return (
    <header className="h-14 bg-white border-b border-[#DADDE1] flex items-center px-4 gap-3 sticky top-0 z-50">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-lg">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676B]" />
          <input
            type="text"
            placeholder="ค้นหา Asset Code, Serial, Name, Repair ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F0F2F5] border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0866FF] placeholder:text-[#65676B]"
          />
        </div>
      </form>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Quick Add Popup */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="p-2 bg-[#0866FF] text-white rounded-full hover:bg-[#0748B3] transition-colors shadow-md"
            title="Quick Add"
          >
            <Plus size={20} />
          </button>

          {showQuickMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQuickMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#DADDE1] z-50 py-2">
                <p className="px-4 py-2 text-[10px] font-semibold text-[#65676B] uppercase tracking-wider">Quick Add</p>
                <Link
                  href="/computers/new"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#42B72A] rounded-full flex items-center justify-center">
                    <Monitor size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Add Computer</p>
                    <p className="text-xs text-[#65676B]">เพิ่มเครื่องใหม่</p>
                  </div>
                </Link>
                <Link
                  href="/repairs/new"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] transition-colors"
                >
                  <div className="w-8 h-8 bg-[#0866FF] rounded-full flex items-center justify-center">
                    <Wrench size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium">New Repair</p>
                    <p className="text-xs text-[#65676B]">สร้างงานซ่อมใหม่</p>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>

        <button className="relative p-2 text-[#65676B] hover:bg-[#F0F2F5] rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FA3E3E] rounded-full border-2 border-white" />
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-[#F0F2F5] rounded-full transition-colors"
          >
            <div className="w-8 h-8 bg-[#0866FF] rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-semibold text-[#1C1E21]">{user?.name}</span>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#DADDE1] z-[70] overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#0866FF] to-[#0748B3] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
                      <span className="text-xl font-bold text-white">{user?.name?.charAt(0) || "U"}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{user?.name}</p>
                      <p className="text-sm text-blue-100">@{user?.username}</p>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#F0F2F5] rounded-lg p-2">
                      <div className="flex items-center gap-1.5 text-[#65676B] text-xs mb-0.5">
                        <Shield size={12} />
                        บทบาท
                      </div>
                      <p className="text-sm font-medium text-[#1C1E21]">{user?.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ช่างเทคนิค"}</p>
                    </div>
                    <div className="bg-[#F0F2F5] rounded-lg p-2">
                      <div className="flex items-center gap-1.5 text-[#65676B] text-xs mb-0.5">
                        <User size={12} />
                        สถานะ
                      </div>
                      <p className="text-sm font-medium text-[#42B72A]">● ออนไลน์</p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-0.5">
                    <Link
                      href="/settings/users"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors"
                    >
                      <User size={18} className="text-[#65676B]" />
                      ข้อมูลส่วนตัว
                    </Link>
                    <Link
                      href="/settings/departments"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors"
                    >
                      <Settings size={18} className="text-[#65676B]" />
                      ตั้งค่าระบบ
                    </Link>
                  </div>

                  <div className="border-t border-[#E4E6EB] mt-2 pt-2">
                    <button
                      onClick={() => { setShowDropdown(false); logout(); }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg w-full transition-colors"
                    >
                      <LogOut size={18} />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
