"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Search, Bell, User, LogOut } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

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
    <header className="h-14 bg-white border-b border-[#DADDE1] flex items-center px-4 gap-3 sticky top-0 z-40">
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
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#DADDE1] z-50 py-2">
                <div className="px-4 py-3 border-b border-[#E4E6EB]">
                  <p className="font-semibold text-[#1C1E21]">{user?.name}</p>
                  <p className="text-sm text-[#65676B]">{user?.username || user?.role}</p>
                </div>
                <Link
                  href="/settings/users"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] transition-colors"
                >
                  <User size={18} className="text-[#65676B]" />
                  ข้อมูลส่วนตัว
                </Link>
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] w-full transition-colors"
                >
                  <LogOut size={18} className="text-[#65676B]" />
                  ออกจากระบบ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
