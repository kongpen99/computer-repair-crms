"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Search, Bell, User, LogOut, Plus, Monitor, Wrench,
  Settings, Shield, Clock, AlertTriangle, CheckCircle2,
  Wrench as WrenchIcon, X,
} from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [stats, setStats] = useState({ computers: 0, repairs: 0, waiting: 0, completed: 0 });
  const bellRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const [bellPos, setBellPos] = useState({ top: 0, right: 0 });
  const [quickPos, setQuickPos] = useState({ top: 0, right: 0 });
  const [userPos, setUserPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const closeAll = () => {
    setShowDropdown(false);
    setShowQuickMenu(false);
    setShowNotifications(false);
    setShowFullProfile(false);
  };

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [searchQuery, router]
  );

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return { top: rect.bottom + 4, right: window.innerWidth - rect.right };
    }
    return { top: 56, right: 20 };
  };

  const notifications: NotificationItem[] = [
    { id: "1", type: "repair", title: "งานซ่อมใหม่", description: "มีงานซ่อมใหม่ที่ต้องดำเนินการ", time: "5 นาทีที่แล้ว", icon: <WrenchIcon size={16} />, color: "bg-blue-500" },
    { id: "2", type: "warning", title: "อะไหล่ใกล้หมด", description: "Power Supply เหลือ 2 ชิ้น", time: "1 ชม.ที่แล้ว", icon: <AlertTriangle size={16} />, color: "bg-yellow-500" },
    { id: "3", type: "success", title: "ซ่อมเสร็จแล้ว", description: "RPR2630-4599 เสร็จสิ้น", time: "2 ชม.ที่แล้ว", icon: <CheckCircle2 size={16} />, color: "bg-green-500" },
    { id: "4", type: "repair", title: "นัดหมาย Vendor", description: "ช่างภายนอกนัดวันศุกร์", time: "3 ชม.ที่แล้ว", icon: <Clock size={16} />, color: "bg-purple-500" },
  ];

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
        {/* Quick Add */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => {
              closeAll();
              setShowQuickMenu(true);
              setQuickPos(calcPos(quickRef));
            }}
            className="p-2 bg-[#0866FF] text-white rounded-full hover:bg-[#0748B3] transition-colors shadow-md"
            title="Click: เมนูด่วน | Double-click: เพิ่มเครื่องใหม่"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              closeAll();
              setShowNotifications(true);
              setBellPos(calcPos(bellRef));
            }}
            className="relative p-2 text-[#65676B] hover:bg-[#F0F2F5] rounded-full transition-colors"
            title="Click: แจ้งเตือน | Double-click: ดูงานซ่อม"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FA3E3E] rounded-full border-2 border-white" />
          </button>
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              closeAll();
              setShowDropdown(true);
              setUserPos(calcPos(userRef));
            }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-[#F0F2F5] rounded-full transition-colors"
            title="Click: เมนูด่วน | Double-click: โปรไฟล์เต็ม"
          >
            <div className="w-8 h-8 bg-[#0866FF] rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">{user?.name?.charAt(0) || "U"}</span>
            </div>
            <span className="hidden sm:block text-sm font-semibold text-[#1C1E21]">{user?.name}</span>
          </button>
        </div>
      </div>

      {/* === POPUPS (Fixed positioned) === */}

      {/* Overlay */}
      {(showDropdown || showQuickMenu || showNotifications || showFullProfile) && (
        <div className="fixed inset-0 z-[90]" onClick={closeAll} />
      )}

      {/* Quick Add Popup */}
      {showQuickMenu && (
        <div className="fixed z-[100] w-72 bg-white rounded-xl shadow-2xl border border-[#DADDE1] overflow-hidden" style={{ top: quickPos.top, right: quickPos.right }}>
          <div className="bg-gradient-to-r from-[#0866FF] to-[#0748B3] p-3">
            <p className="text-white text-sm font-semibold">⚡ Quick Actions</p>
            <p className="text-blue-100 text-xs mt-0.5">Double-click ปุ่ม + เพื่อเพิ่มเครื่องใหม่</p>
          </div>
          <div className="p-2">
            <Link href="/computers/new" onClick={closeAll}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors">
              <div className="w-9 h-9 bg-[#42B72A] rounded-full flex items-center justify-center">
                <Monitor size={16} className="text-white" />
              </div>
              <div>
                <p className="font-medium">Add Computer</p>
                <p className="text-xs text-[#65676B]">เพิ่มเครื่อง Computer ใหม่เข้าระบบ</p>
              </div>
            </Link>
            <Link href="/repairs/new" onClick={closeAll}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors">
              <div className="w-9 h-9 bg-[#0866FF] rounded-full flex items-center justify-center">
                <Wrench size={16} className="text-white" />
              </div>
              <div>
                <p className="font-medium">New Repair</p>
                <p className="text-xs text-[#65676B]">สร้างรายการซ่อมใหม่</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Notifications Popup */}
      {showNotifications && (
        <div className="fixed z-[100] w-80 bg-white rounded-xl shadow-2xl border border-[#DADDE1] overflow-hidden" style={{ top: bellPos.top, right: bellPos.right }}>
          <div className="flex items-center justify-between p-3 border-b border-[#E4E6EB]">
            <div>
              <p className="text-sm font-semibold text-[#1C1E21]">🔔 แจ้งเตือน</p>
              <p className="text-xs text-[#65676B]">{notifications.length} รายการใหม่</p>
            </div>
            <button onClick={closeAll} className="p-1 hover:bg-[#F0F2F5] rounded-lg">
              <X size={16} className="text-[#65676B]" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 px-3 py-3 hover:bg-[#F0F2F5] border-b border-[#F0F2F5] last:border-0 cursor-pointer">
                <div className={`w-8 h-8 ${n.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white">{n.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1E21]">{n.title}</p>
                  <p className="text-xs text-[#65676B] truncate">{n.description}</p>
                  <p className="text-[10px] text-[#65676B] mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-[#E4E6EB]">
            <Link href="/repairs" onClick={closeAll}
              className="block text-center text-sm text-[#0866FF] font-medium py-1.5 hover:bg-[#E7F3FF] rounded-lg">
              ดูทั้งหมด →
            </Link>
          </div>
        </div>
      )}

      {/* User Quick Popup */}
      {showDropdown && !showFullProfile && (
        <div className="fixed z-[100] w-80 bg-white rounded-xl shadow-2xl border border-[#DADDE1] overflow-hidden" style={{ top: userPos.top, right: userPos.right }}>
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
          <div className="p-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#F0F2F5] rounded-lg p-2">
                <div className="flex items-center gap-1.5 text-[#65676B] text-xs mb-0.5">
                  <Shield size={12} /> บทบาท
                </div>
                <p className="text-sm font-medium text-[#1C1E21]">{user?.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ช่างเทคนิค"}</p>
              </div>
              <div className="bg-[#F0F2F5] rounded-lg p-2">
                <div className="flex items-center gap-1.5 text-[#65676B] text-xs mb-0.5">
                  <User size={12} /> สถานะ
                </div>
                <p className="text-sm font-medium text-[#42B72A]">● ออนไลน์</p>
              </div>
            </div>
            <div className="space-y-0.5">
              <button onClick={() => { closeAll(); setShowFullProfile(true); setUserPos(calcPos(userRef)); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors w-full text-left">
                <User size={18} className="text-[#65676B]" /> ดูโปรไฟล์เต็ม →
              </button>
              <Link href="/settings/users" onClick={closeAll}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors">
                <Settings size={18} className="text-[#65676B]" /> ตั้งค่าระบบ
              </Link>
            </div>
            <div className="border-t border-[#E4E6EB] mt-2 pt-2">
              <button onClick={() => { closeAll(); logout(); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg w-full transition-colors">
                <LogOut size={18} /> ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Profile Popup */}
      {showFullProfile && (
        <div className="fixed z-[100] w-96 bg-white rounded-xl shadow-2xl border border-[#DADDE1] overflow-hidden" style={{ top: userPos.top, right: userPos.right }}>
          <div className="bg-gradient-to-r from-[#0866FF] to-[#0748B3] p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
                <span className="text-2xl font-bold text-white">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <div>
                <p className="font-bold text-white text-xl">{user?.name}</p>
                <p className="text-sm text-blue-100">@{user?.username}</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F0F2F5] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-[#65676B] text-xs mb-1">
                  <Shield size={12} /> บทบาท
                </div>
                <p className="text-sm font-semibold text-[#1C1E21]">{user?.role === "ADMIN" ? "ผู้ดูแลระบบ (Admin)" : "ช่างเทคนิค (Technician)"}</p>
              </div>
              <div className="bg-[#F0F2F5] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-[#65676B] text-xs mb-1">
                  <User size={12} /> สถานะ
                </div>
                <p className="text-sm font-semibold text-[#42B72A]">● ออนไลน์</p>
              </div>
            </div>
            <div className="bg-[#F0F2F5] rounded-lg p-3">
              <p className="text-xs text-[#65676B] mb-2 font-medium">📊 สถิติการทำงาน</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0866FF]">{stats.computers}</p>
                  <p className="text-[10px] text-[#65676B]">เครื่องทั้งหมด</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#FB923C]">{stats.waiting}</p>
                  <p className="text-[10px] text-[#65676B]">รอดำเนินการ</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#42B72A]">{stats.completed}</p>
                  <p className="text-[10px] text-[#65676B]">ซ่อมเสร็จ</p>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Link href="/settings/users" onClick={closeAll}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors">
                <User size={18} className="text-[#65676B]" /> ข้อมูลส่วนตัว
              </Link>
              <Link href="/settings/departments" onClick={closeAll}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#1C1E21] hover:bg-[#F0F2F5] rounded-lg transition-colors">
                <Settings size={18} className="text-[#65676B]" /> ตั้งค่าระบบ
              </Link>
            </div>
            <div className="border-t border-[#E4E6EB] pt-2">
              <button onClick={() => { closeAll(); logout(); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#FA3E3E] hover:bg-[#FDEDEF] rounded-lg w-full transition-colors">
                <LogOut size={18} /> ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
